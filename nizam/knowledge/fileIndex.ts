import { buildResumeIndex } from "../resume/resumeIndex.ts";
import { hasPhrase, normalizeCanonicalQuery, normalizeQuery, tokenize } from "../retrieval/queryNormalizer.ts";
import { detectTemporalIntent, type TemporalIntent } from "../temporal/temporalFacts.ts";

export interface KnowledgeChunk {
  id: string;
  source: string;
  category: string;
  title?: string;
  content: string;
  keywords: string[];
  priority?: number;
}

export const MAX_RETRIEVED_CHUNKS = 5;

const KNOWLEDGE_FILES = [
  "identity.md",
  "biography.md",
  "career.md",
  "experience.md",
  "projects.md",
  "skills.md",
  "articles.md",
  "philosophy.md",
  "personality.md",
  "interview.md",
  "faq.md",
  "privacy.md",
  "conversation.md",
  "current-status.md",
];

let cachedChunks: KnowledgeChunk[] | null = null;

export const buildKnowledgeIndex = async (): Promise<KnowledgeChunk[]> => {
  if (cachedChunks) {
    return cachedChunks;
  }

  const fileChunks = (await Promise.all(KNOWLEDGE_FILES.map(loadFileChunks))).flat();
  const resumeChunks = buildResumeIndex().map((section): KnowledgeChunk => ({
    id: section.id,
    source: "resumeSource.ts",
    category: section.intent,
    title: section.title,
    content: section.content,
    keywords: [...section.keywords, ...(section.phrases ?? [])],
    priority: section.priority,
  }));

  cachedChunks = [...resumeChunks, ...fileChunks];
  return cachedChunks;
};

export const retrieveKnowledgeChunks = async (
  query: string,
  expandedTerms: string[] = [],
  limit = MAX_RETRIEVED_CHUNKS,
): Promise<KnowledgeChunk[]> => {
  const chunks = await buildKnowledgeIndex();
  const searchText = [query, ...expandedTerms].join(" ");
  const normalized = normalizeQuery(searchText);
  const queryTokens = new Set(tokenize(searchText));
  const temporalIntent = detectTemporalIntent(query);

  const ranked = chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, normalized, queryTokens) + temporalSourceBoost(chunk, temporalIntent),
    }))
    .filter(({ score }) => score >= 5)
    .sort((a, b) => b.score - a.score || (b.chunk.priority ?? 0) - (a.chunk.priority ?? 0))
    .slice(0, limit)
    .map(({ chunk }) => chunk);

  if (temporalIntent !== "general") {
    const currentStatus = chunks.find((chunk) => chunk.source === "current-status.md");
    if (currentStatus && !ranked.some((chunk) => chunk.id === currentStatus.id)) {
      return [currentStatus, ...ranked].slice(0, limit);
    }
  }

  return ranked;
};

const TEMPORAL_SOURCE_BOOSTS: Record<TemporalIntent, string[]> = {
  current_employment: [
    "employment",
    "current-status",
    "career",
    "experience",
    "projects",
    "goals",
  ],
  current_activity: [
    "current-status",
    "projects",
    "goals",
    "career",
  ],
  previous_employment: ["employment", "experience", "career"],
  employment_history: ["employment", "experience", "career"],
  employment_end_date: ["employment", "experience", "current-status"],
  employment_start_date: ["employment", "experience"],
  latest_state: ["employment", "current-status", "career", "projects", "goals"],
  general: [],
};

const temporalSourceBoost = (
  chunk: KnowledgeChunk,
  intent: TemporalIntent,
): number => {
  const boosts = TEMPORAL_SOURCE_BOOSTS[intent];
  if (boosts.length === 0) {
    return 0;
  }

  const haystack = normalizeQuery(`${chunk.id} ${chunk.source} ${chunk.category} ${chunk.title ?? ""} ${chunk.content}`);
  return boosts.some((boost) => haystack.includes(normalizeQuery(boost))) ? 20 : 0;
};

const loadFileChunks = async (filename: string): Promise<KnowledgeChunk[]> => {
  try {
    const fileUrl = new URL(`./${filename}`, import.meta.url);
    const text = await Deno.readTextFile(fileUrl);
    return splitMarkdownIntoChunks(filename, text);
  } catch (_error) {
    return [];
  }
};

const splitMarkdownIntoChunks = (source: string, text: string): KnowledgeChunk[] => {
  const category = source.replace(/\.(md|json)$/i, "");
  const sections = text
    .split(/\n(?=#{1,3}\s+)/)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section, index) => {
    const title = section.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim();
    const content = section.slice(0, 1800);

    return {
      id: `${category}-${index + 1}`,
      source,
      category,
      title,
      content,
      keywords: extractKeywords(`${title ?? ""} ${content}`),
      priority: title ? 70 : 50,
    };
  });
};

const extractKeywords = (text: string): string[] =>
  [...new Set(
    tokenize(text)
      .filter((token) => token.length > 2)
      .slice(0, 40),
  )];

const scoreChunk = (
  chunk: KnowledgeChunk,
  normalizedQuery: string,
  queryTokens: Set<string>,
): number => {
  let score = 0;

  if (chunk.title && hasPhrase(normalizedQuery, chunk.title)) {
    score += 12;
  }

  for (const keyword of chunk.keywords) {
    const normalizedKeyword = normalizeCanonicalQuery(keyword);
    if (normalizedKeyword.includes(" ") && hasPhrase(normalizedQuery, normalizedKeyword)) {
      score += 7;
    } else if (queryTokens.has(normalizedKeyword)) {
      score += 3;
    }
  }

  const normalizedContent = normalizeQuery(chunk.content);
  for (const token of queryTokens) {
    if (token.length > 2 && normalizedContent.includes(token)) {
      score += 1;
    }
  }

  return score + ((chunk.priority ?? 0) / 1000);
};
