import type { OpenAIMessage } from "../openaiClient.ts";

export type QueryExpansion = {
  intent: string;
  searchTerms: string[];
};

export const buildQueryExpansionMessages = (question: string): OpenAIMessage[] => [
  {
    role: "system",
    content:
      "You are a query planner for local file search. Return only compact JSON with keys intent and searchTerms. Do not answer the user. Generate 3-6 search terms for finding facts in Nizamuddin Ali Ahmed's local resume, story, project, skill, and profile files.",
  },
  {
    role: "user",
    content: question,
  },
];

export const parseQueryExpansion = (raw: string): QueryExpansion => {
  try {
    const jsonText = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(jsonText) as Partial<QueryExpansion>;
    return {
      intent: typeof parsed.intent === "string" ? parsed.intent : "unknown",
      searchTerms: Array.isArray(parsed.searchTerms)
        ? parsed.searchTerms.filter((term): term is string => typeof term === "string").slice(0, 6)
        : [],
    };
  } catch (_error) {
    return {
      intent: "unknown",
      searchTerms: [],
    };
  }
};
