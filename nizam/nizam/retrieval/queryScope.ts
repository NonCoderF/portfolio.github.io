import { normalizeQuery } from "./queryNormalizer.ts";

export type QueryScope = "personal" | "general";

const personalPatterns = [
  /\byou\b/,
  /\byour\b/,
  /\byourself\b/,
  /\bdid you\b/,
  /\bdo you\b/,
  /\bare you\b/,
  /\bwere you\b/,
  /\bwould you\b/,
  /\bwhy did you\b/,
  /\bhow did you\b/,
  /\bwhat do you think\b/,
  /\bwhat is your\b/,
  /\bwhat are your\b/,
  /\btell me about yourself\b/,
  /\bnizam\b/,
  /\bnizamuddin\b/,
  /\bwhy android\b/,
  /\bwhy kotlin\b/,
  /\bfavorite project\b/,
  /\bfavourite project\b/,
];

const generalAdvicePatterns = [
  /\bhow can i\b/,
  /\bhow do i\b/,
  /\bexplain\b/,
  /\bwhat is\b(?! your\b)/,
  /\bwrite\b.*\bcode\b/,
];

export const detectQueryScope = (query: string): QueryScope => {
  const normalized = normalizeQuery(query);

  if (personalPatterns.some((pattern) => pattern.test(normalized))) {
    return "personal";
  }

  if (generalAdvicePatterns.some((pattern) => pattern.test(normalized))) {
    return "general";
  }

  return "general";
};
