import type { DetectedIntent } from "../retrieval/intentDetector.ts";
import type { QueryScope } from "../retrieval/queryScope.ts";
import { normalizeQuery } from "../retrieval/queryNormalizer.ts";
import type { ResumeSection } from "../resume/types.ts";

export type AnswerMode =
  | "verified"
  | "grounded_synthesis"
  | "persona_reasoning"
  | "unknown";

const verifiedIntents = new Set([
  "identity",
  "education",
  "experience",
  "skills",
  "articles",
]);

export const chooseAnswerMode = (
  scope: QueryScope,
  detected: DetectedIntent,
  sections: ResumeSection[],
  contextCount = sections.length,
  query = "",
): AnswerMode => {
  if (scope === "general") {
    return "grounded_synthesis";
  }

  if (isConcretePersonalFactQuery(query)) {
    return "unknown";
  }

  if (isPersonaSafeIntent(detected.intent)) {
    return "persona_reasoning";
  }

  if (contextCount === 0) {
    return "persona_reasoning";
  }

  if (sections.length === 0 && contextCount > 0) {
    return "grounded_synthesis";
  }

  if (sections.length === 0) {
    return "unknown";
  }

  if (verifiedIntents.has(detected.intent)) {
    return "verified";
  }

  if (detected.intent === "projects" || detected.intent === "biography" || detected.intent === "motivation" || detected.intent === "goals" || detected.intent === "achievements") {
    return "grounded_synthesis";
  }

  if (detected.intent === "engineering_opinion" || detected.intent === "hypothetical" || detected.intent === "preference" || detected.intent === "personality") {
    return "persona_reasoning";
  }

  return "grounded_synthesis";
};

const isPersonaSafeIntent = (intent: DetectedIntent["intent"]): boolean =>
  intent === "engineering_opinion" ||
  intent === "hypothetical" ||
  intent === "preference" ||
  intent === "personality";

export const isConcretePersonalFactQuery = (query: string): boolean => {
  const normalized = normalizeQuery(query);

  return /\b(cgpa|registration number|roll number|phone|email|salary|address|current location|current city|birthplace|place of birth|certification|certificate|relationship|family|medical|legal)\b/.test(normalized) ||
    /\b(have you worked with|have you used|your experience with|do you know)\b/.test(normalized);
};
