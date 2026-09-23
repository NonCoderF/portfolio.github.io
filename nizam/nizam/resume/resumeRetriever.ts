import { detectIntent } from "../retrieval/intentDetector.ts";
import { hasPhrase, normalizeCanonicalQuery, normalizeQuery, tokenize } from "../retrieval/queryNormalizer.ts";
import { buildResumeIndex } from "./resumeIndex.ts";
import { expandRelatedContext } from "./relatedContext.ts";
import type { ResumeSection } from "./types.ts";

export const MAX_RESUME_SECTIONS = 4;

const sectionById = (id: string): ResumeSection =>
  buildResumeIndex().find((section) => section.id === id)!;

export const retrieveResumeSections = (
  query: string,
  limit = MAX_RESUME_SECTIONS,
): ResumeSection[] => {
  const detected = detectIntent(query);
  const direct = directSectionsForIntent(detected.intent, query);

  if (direct.length > 0) {
    return expandRelatedContext(direct.slice(0, limit), shouldExpandRelated(query) ? 2 : 0)
      .slice(0, limit);
  }

  if (detected.intent === "general") {
    return [];
  }

  const normalized = normalizeQuery(query);
  const queryTokens = new Set(tokenize(query));

  return buildResumeIndex()
    .map((section) => ({ section, score: scoreSection(section, normalized, queryTokens) }))
    .filter(({ score }) => score >= 5)
    .sort((a, b) => b.score - a.score || (b.section.priority ?? 0) - (a.section.priority ?? 0))
    .slice(0, limit)
    .map(({ section }) => section);
};

const directSectionsForIntent = (
  intent: ReturnType<typeof detectIntent>["intent"],
  query: string,
): ResumeSection[] => {
  const normalized = normalizeQuery(query);

  if (/\b(who are you|tell me about yourself|introduce yourself|can you introduce yourself|about you|what do you do|describe yourself)\b/.test(normalized)) {
    return [
      sectionById("resume-identity"),
      sectionById("resume-education"),
      sectionById("resume-experience"),
      sectionById("resume-career-story"),
    ];
  }

  switch (intent) {
    case "identity":
      return [sectionById("resume-identity")];
    case "education":
      return [sectionById("resume-education")];
    case "biography":
      return [sectionById("resume-career-story"), sectionById("resume-education")];
    case "projects":
      return [sectionById("resume-projects"), sectionById("resume-career-story")];
    case "experience":
      return [sectionById("resume-experience")];
    case "skills":
      return [sectionById("resume-skills")];
    case "articles":
      return [sectionById("resume-articles")];
    case "motivation":
    case "goals":
      return [sectionById("resume-mission"), sectionById("resume-career-story")];
    case "preference":
    case "personality":
      return [sectionById("resume-mission"), sectionById("resume-career-story"), sectionById("resume-skills")];
    case "achievements":
      return [sectionById("resume-achievements"), sectionById("resume-projects")];
    case "engineering_opinion":
      return [sectionById("resume-skills"), sectionById("resume-projects"), sectionById("resume-career-story")];
    case "hypothetical":
      return [sectionById("resume-mission"), sectionById("resume-skills"), sectionById("resume-career-story")];
    default:
      return [];
  }
};

const shouldExpandRelated = (query: string): boolean => {
  const normalized = normalizeQuery(query);
  return /\bwhy\b|\bwhat kind\b|\bmotivates\b|\bmission\b|\bopinion\b|\bwould you\b/.test(normalized);
};

const scoreSection = (
  section: ResumeSection,
  normalizedQuery: string,
  queryTokens: Set<string>,
): number => {
  let score = 0;

  for (const phrase of section.phrases ?? []) {
    if (hasPhrase(normalizedQuery, phrase)) {
      score += 12;
    }
  }

  for (const keyword of section.keywords) {
    const normalizedKeyword = normalizeCanonicalQuery(keyword);
    if (normalizedKeyword.includes(" ") && hasPhrase(normalizedQuery, normalizedKeyword)) {
      score += 7;
    } else if (queryTokens.has(normalizedKeyword)) {
      score += 4;
    }
  }

  return score + ((section.priority ?? 0) / 1000);
};
