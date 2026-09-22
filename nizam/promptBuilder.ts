import { classifyIntent, type MemorySection } from "./intentClassifier.ts";

export type MemoryRetriever = (userMessage: string) => MemorySection[];

const KNOWLEDGE_FILES: Record<MemorySection | "conversation", string> = {
  conversation: "./knowledge/conversation.md",
  identity: "./knowledge/identity.md",
  biography: "./knowledge/biography.md",
  career: "./knowledge/career.md",
  experience: "./knowledge/experience.md",
  projects: "./knowledge/projects.md",
  articles: "./knowledge/articles.md",
  skills: "./knowledge/skills.md",
  philosophy: "./knowledge/philosophy.md",
  personality: "./knowledge/personality.md",
  interview: "./knowledge/interview.md",
  faq: "./knowledge/faq.md",
  privacy: "./knowledge/privacy.md",
};

const BASE_SECTIONS = ["conversation"] as const;

const memoryCache = new Map<string, string>();

// Knowledge files are loaded lazily and cached for warm Edge Function isolates.
const loadKnowledgeFile = async (
  section: keyof typeof KNOWLEDGE_FILES,
): Promise<string> => {
  const cached = memoryCache.get(section);

  if (cached) {
    return cached;
  }

  const fileUrl = new URL(KNOWLEDGE_FILES[section], import.meta.url);
  const content = await Deno.readTextFile(fileUrl);
  const formatted = `## MEMORY: ${section}\n${content.trim()}`;
  memoryCache.set(section, formatted);

  return formatted;
};

const defaultRetriever: MemoryRetriever = (userMessage) =>
  classifyIntent(userMessage).sections;

const unique = <T>(items: T[]): T[] => [...new Set(items)];

const formatCurrentDate = (): string =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

export const buildPrompt = async (
  userMessage: string,
  retriever: MemoryRetriever = defaultRetriever,
): Promise<string> => {
  const retrievedSections = retriever(userMessage);
  const sections = unique([...BASE_SECTIONS, ...retrievedSections]);

  const memories = await Promise.all(
    sections.map((section) => loadKnowledgeFile(section)),
  );

  return [
    "DIGITAL TWIN MEMORY SYSTEM",
    "Use the loaded memories below as my lived memory for this reply.",
    `Current date: ${formatCurrentDate()}.`,
    "Answer the user's latest message naturally as Nizamuddin Ali Ahmed.",
    ...memories,
  ].join("\n\n");
};
