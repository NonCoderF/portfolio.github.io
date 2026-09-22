import type { QueryScope } from "../retrieval/queryScope.ts";
import type { ResumeSection } from "../resume/types.ts";

export const personalizeAnswer = (
  _query: string,
  draft: string,
  scope: QueryScope,
  sections: ResumeSection[],
): string => {
  const trimmed = draft.trim();

  if (scope !== "personal" || sections.length === 0) {
    return trimmed;
  }

  return trimmed
    .replace(/\bNizamuddin Ali Ahmed is\b/g, "I am")
    .replace(/\bNizamuddin is\b/g, "I am")
    .replace(/\bNizamuddin has\b/g, "I have")
    .replace(/\bNizamuddin's\b/g, "My");
};
