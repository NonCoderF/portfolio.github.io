import { buildResumeIndex } from "./resumeIndex.ts";
import type { ResumeSection } from "./types.ts";

const knowledgeRelations: Record<string, string[]> = {
  "resume-projects": [
    "resume-skills",
    "resume-mission",
  ],
  "resume-education": [
    "resume-career-story",
    "resume-skills",
  ],
  "resume-career-story": [
    "resume-education",
    "resume-skills",
  ],
  "resume-skills": [
    "resume-career-story",
    "resume-projects",
  ],
  "resume-mission": [
    "resume-career-story",
    "resume-projects",
  ],
};

export const expandRelatedContext = (
  sections: ResumeSection[],
  maxRelated = 2,
): ResumeSection[] => {
  const index = buildResumeIndex();
  const existingIds = new Set(sections.map((section) => section.id));
  const relatedIds = sections
    .flatMap((section) => knowledgeRelations[section.id] ?? [])
    .filter((id) => !existingIds.has(id))
    .slice(0, maxRelated);

  return [
    ...sections,
    ...relatedIds
      .map((id) => index.find((section) => section.id === id))
      .filter((section): section is ResumeSection => Boolean(section)),
  ];
};
