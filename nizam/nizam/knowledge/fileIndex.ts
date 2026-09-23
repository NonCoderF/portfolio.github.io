import { buildResumeIndex } from "../resume/resumeIndex.ts";
import { hasPhrase, normalizeCanonicalQuery, normalizeQuery, tokenize } from "../retrieval/queryNormalizer.ts";
import { detectTemporalIntent, type TemporalIntent } from "../temporal/temporalFacts.ts";
import { CORE_KNOWLEDGE_IDS, NIZAM_KNOWLEDGE } from "./index.ts";
import type { KnowledgeRecord } from "./types.ts";

export type KnowledgeChunk = KnowledgeRecord;

export const MAX_RETRIEVED_CHUNKS = 5;

export const KNOWLEDGE_SOURCE = "TYPESCRIPT_STATIC_IMPORT" as const;

let cachedChunks: KnowledgeChunk[] | null = null;

export const buildKnowledgeIndex = async (): Promise<KnowledgeChunk[]> => {
  if (cachedChunks) {
    return cachedChunks;
  }

  const personalChunks: KnowledgeChunk[] = NIZAM_KNOWLEDGE;
  const resumeChunks = buildResumeIndex().map((section): KnowledgeChunk => ({
    id: section.id,
    source: "resumeSource.ts",
    category: section.intent,
    title: section.title,
    content: section.content,
    type: "fact",
    topics: [...section.keywords, ...(section.phrases ?? [])],
    keywords: [...section.keywords, ...(section.phrases ?? [])],
    verified: true,
    priority: section.priority,
  }));

  cachedChunks = [...resumeChunks, ...personalChunks];
  return cachedChunks;
};

export const getKnowledgeDiagnostics = () => ({
  source: KNOWLEDGE_SOURCE,
  recordCount: NIZAM_KNOWLEDGE.length,
  coreRecords: Object.fromEntries(CORE_KNOWLEDGE_IDS.map((id) => [
    id,
    NIZAM_KNOWLEDGE.some((record) => record.id === id) ? "FOUND" : "MISSING",
  ])),
});

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
    const currentStatus = chunks.find((chunk) => chunk.source === "typescript:current-status");
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
