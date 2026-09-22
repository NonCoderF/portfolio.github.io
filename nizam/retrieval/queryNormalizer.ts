const aliases: Record<string, string[]> = {
  dob: ["date of birth", "birthday", "born"],
  kmm: ["kotlin multiplatform", "kotlin multiplatform mobile"],
  tflite: ["tensorflow lite"],
  mvvm: ["model view viewmodel"],
  hometown: ["home town", "native place", "roots"],
  vc: ["vantage circle"],
};

const typoReplacements: Array<[RegExp, string]> = [
  [/\bborned\b/g, "born"],
  [/\bbday\b/g, "birthday"],
  [/\bdob\b/g, "date of birth"],
  [/\byoy\b/g, "you"],
  [/\bur\b/g, "your"],
  [/\bu\b/g, "you"],
  [/\bdid you born\b/g, "were you born"],
  [/\bwhen you born\b/g, "when were you born"],
  [/\bwhich date were you born\b/g, "what is your date of birth"],
  [/\bwhen you were born\b/g, "when were you born"],
  [/\bbirth place\b/g, "birthplace"],
  [/\bwhere you born\b/g, "where were you born"],
  [/\bwhere are you born\b/g, "where were you born"],
  [/\bwhere did you born\b/g, "where were you born"],
  [/\bwhere was you born\b/g, "where were you born"],
  [/\bwhere you from\b/g, "where are you from"],
  [/\bwhere do you from\b/g, "where are you from"],
  [/\bwhat s\b/g, "what is"],
  [/\bwhats\b/g, "what is"],
  [/\bwhat your birthday\b/g, "what is your birthday"],
  [/\bwhat is your date of birth\b/g, "what is your date of birth"],
  [/\bclg\b/g, "college"],
  [/\bfav\b/g, "favorite"],
  [/\bself taught\b/g, "self-taught"],
  [/\bandroid dev\b/g, "android developer"],
  [/\bprogrammer\b/g, "developer"],
  [/\bteach you\b/g, "taught you"],
  [/\btensor flow lite\b/g, "tensorflow lite"],
];

export const normalizeCanonicalQuery = (input: string): string => normalizeBase(input);

export const normalizeQuery = (input: string): string => {
  let normalized = normalizeCanonicalQuery(input);

  const expansions = Object.entries(aliases)
    .filter(([alias]) => new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(normalized))
    .flatMap(([, values]) => values);

  return [...new Set([normalized, ...expansions])].join(" ").replace(/\s+/g, " ").trim();
};

const normalizeBase = (input: string): string => {
  let normalized = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s+#./-]/g, " ")
    .replace(/[_]/g, " ");

  for (const [pattern, replacement] of typoReplacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized.replace(/\s+/g, " ").trim();
};

export const tokenize = (input: string): string[] =>
  [...new Set(normalizeQuery(input).split(" ").filter((token) => token.length > 1))];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const hasPhrase = (normalizedQuery: string, phrase: string): boolean =>
  new RegExp(`(^|\\s)${escapeRegExp(normalizeBase(phrase))}(\\s|$)`).test(normalizedQuery);
