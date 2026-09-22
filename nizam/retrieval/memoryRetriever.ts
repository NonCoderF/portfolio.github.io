import { MEMORIES, type Memory } from "../knowledge/memories.ts";
import { detectIntent, isPersonalQuestion } from "./intentDetector.ts";
import { hasPhrase, normalizeCanonicalQuery, normalizeQuery, tokenize } from "./queryNormalizer.ts";
import { isAgeIntent } from "./age.ts";

export interface MemoryRetriever {
  retrieve(query: string, limit?: number): Memory[];
}

export const MAX_MEMORIES = 3;

const broadKeywords = new Set(["from", "about", "experience", "project", "android", "do", "you", "your"]);

const directIdentityIds = new Set([
  "identity-dob",
  "identity-hometown",
  "identity-education",
  "identity-profession",
]);

const singleBestIds = new Set([
  ...directIdentityIds,
  "education-mechanical-engineering",
  "experience-vantage-circle",
  "experience-kbg",
  "experience-geekworkx",
  "project-archguard",
  "project-sonicbridge",
  "project-tapori-ai",
  "project-biometric-sdk",
  "project-orhan",
  "project-sally-launcher",
  "project-shockwave",
  "article-subtitle-algorithm",
  "article-in-app-updates",
  "article-biometric-system",
  "article-pyaar-ka-algorithm",
]);

const portfolioAnchors = [
  "nizam",
  "nizamuddin",
  "ali ahmed",
  "archguard",
  "sonicbridge",
  "sonic bridge",
  "tapori",
  "vantage circle",
  "kbg",
  "geekworkx",
  "biometric sdk",
  "orhan",
  "sally",
  "shockwave",
  "mukalmua",
];

class KeywordMemoryRetriever implements MemoryRetriever {
  retrieve(query: string, limit = MAX_MEMORIES): Memory[] {
    const normalized = normalizeQuery(query);
    const queryTokens = new Set(tokenize(query));
    const detectedIntent = detectIntent(query);

    if (detectedIntent.identitySubtype === "birthplace") {
      return [MEMORIES.find((memory) => memory.id === "identity-birthplace")!];
    }

    if (detectedIntent.intent === "biography") {
      return [MEMORIES.find((memory) => memory.id === "biography-career-transition")!];
    }

    if (detectedIntent.intent === "education") {
      return [MEMORIES.find((memory) => memory.id === "education-mechanical-engineering")!];
    }

    if (
      /\b(tell me about yourself|introduce yourself|about you|your story)\b/.test(normalized)
    ) {
      return [
        "identity-summary",
        "biography-origin",
        "career-summary",
      ].map((id) => MEMORIES.find((memory) => memory.id === id)!);
    }

    if (!isPersonalQuestion(query) && !portfolioAnchors.some((anchor) => hasPhrase(normalized, anchor))) {
      return [];
    }

    const scored = MEMORIES.map((memory) => ({
      memory,
      score: scoreMemory(memory, normalized, queryTokens),
    }))
      .filter(({ score }) => score >= 5)
      .sort((a, b) => b.score - a.score || (b.memory.priority ?? 0) - (a.memory.priority ?? 0));

    if (scored.length === 0) {
      return [];
    }

    const best = scored[0].memory;
    const bestScore = scored[0].score;

    if (
      singleBestIds.has(best.id) &&
      (bestScore >= 12 || isAgeIntent(normalized))
    ) {
      return [best];
    }

    return scored.slice(0, Math.min(limit, MAX_MEMORIES)).map(({ memory }) => memory);
  }
}

const scoreMemory = (
  memory: Memory,
  normalizedQuery: string,
  queryTokens: Set<string>,
): number => {
  let score = 0;
  let strongMatch = false;

  for (const phrase of memory.phrases ?? []) {
    if (hasPhrase(normalizedQuery, phrase)) {
      score += 12;
      strongMatch = true;
    }
  }

  for (const keyword of memory.keywords) {
    const normalizedKeyword = normalizeCanonicalQuery(keyword);
    const keywordTokens = normalizedKeyword.split(" ");

    if (keywordTokens.length > 1 && hasPhrase(normalizedQuery, normalizedKeyword)) {
      score += 7;
      strongMatch = true;
      continue;
    }

    if (keywordTokens.length === 1 && queryTokens.has(normalizedKeyword)) {
      if (broadKeywords.has(normalizedKeyword) && !strongMatch) {
        continue;
      }
      score += 4;
    }
  }

  for (const token of queryTokens) {
    if (broadKeywords.has(token)) {
      continue;
    }
    if (
      memory.keywords.some((keyword) => tokenize(keyword).includes(token)) ||
      (memory.phrases ?? []).some((phrase) => tokenize(phrase).includes(token))
    ) {
      score += 1;
    }
  }

  if (!strongMatch && score < 8) {
    return 0;
  }

  return score + ((memory.priority ?? 0) / 1000);
};

export const memoryRetriever: MemoryRetriever = new KeywordMemoryRetriever();
