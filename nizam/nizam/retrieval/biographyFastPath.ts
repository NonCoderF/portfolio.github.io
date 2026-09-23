import { parseResume } from "../resume/resumeParser.ts";
import { isPersonalCodingJourneyQuery } from "./intentDetector.ts";
import { normalizeCanonicalQuery } from "./queryNormalizer.ts";

export type BiographyFastPathResult = {
  intent: "biography";
  reply: string;
};

const biographyFastPathQuestions = [
  /^where did you learn coding$/,
  /^how did you learn coding$/,
  /^are you self-taught$/,
  /^you are self-taught$/,
];

export const getBiographyFastPathReply = (): string => {
  const resume = parseResume();

  return `I'm self-taught. I studied ${resume.education.degree.replace("Bachelor of Engineering in ", "")}, then learned Java, Data Structures, Algorithms, and Kotlin on my own before moving into Android development.`;
};

export const getBiographyFastPath = (
  userPrompt: string,
): BiographyFastPathResult | null => {
  const normalized = normalizeCanonicalQuery(userPrompt);

  if (
    isPersonalCodingJourneyQuery(userPrompt) &&
    biographyFastPathQuestions.some((pattern) => pattern.test(normalized))
  ) {
    return {
      intent: "biography",
      reply: getBiographyFastPathReply(),
    };
  }

  return null;
};
