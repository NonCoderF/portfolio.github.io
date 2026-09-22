import type { OpenAIMessage } from "../openaiClient.ts";

export type UnderstandingMode = "personal" | "general" | "blended";
export type SemanticIntent =
  | "technical_experience"
  | "opinion"
  | "advice"
  | "personal_fact"
  | "general_question"
  | "project_question"
  | "other";

export type QueryUnderstanding = {
  mode: UnderstandingMode;
  intent: SemanticIntent;
  topics: string[];
  retrievalQueries: string[];
  needsPersonalMemory: boolean;
  needsGeneralKnowledge: boolean;
  personalClaimsMustBeVerified: boolean;
  shouldSurfaceResources: boolean;
  confidence: number;
};

const VALID_MODES = new Set<UnderstandingMode>(["personal", "general", "blended"]);
const VALID_INTENTS = new Set<SemanticIntent>([
  "technical_experience", "opinion", "advice", "personal_fact",
  "general_question", "project_question", "other",
]);

export const buildUnderstandingMessages = (query: string): OpenAIMessage[] => [
  {
    role: "system",
    content: `You are the semantic router for Digital Nizam. Understand meaning, not wording. Return one compact JSON object only; never answer the user.

Modes:
- personal: asks what Nizam actually did, used, built, experienced, prefers, or what is factually true about him.
- general: asks for knowledge that does not require Nizam's history.
- blended: asks for Nizam's present professional opinion, advice, design approach, or reasoning where his experience can ground a broader answer.

Unknown is not a mode. A request about unverified experience is still personal/technical_experience and must be searched before absence is concluded.

Intents: technical_experience, opinion, advice, personal_fact, general_question, project_question, other.

topics: up to 6 normalized concepts. Resolve aliases and conceptual paraphrases. For example, questions about deploying mobile ML, on-device inference, activity classification, or exercise AI may include concepts such as Android, on-device ML, TensorFlow Lite, pose detection, or exercise recognition when semantically relevant.

retrieval_queries: 2-5 short semantic descriptions of evidence that would answer the question. Do not merely copy the sentence.

needs_personal_memory: true whenever Nizam's identity, history, experience, projects, preferences, or professional perspective matters.
needs_general_knowledge: true for explanations, recommendations, comparisons, opinions, designs, and new problem solving.
personal_claims_must_be_verified: true whenever the final answer could claim Nizam did, used, built, implemented, experienced, previously preferred, or worked on something.
should_surface_resources: true only when the user asks about a specific project/module, asks to see/open it, or a resource would materially support follow-up exploration. Retrieval alone is not a reason.
confidence: 0 to 1.

Schema:
{"mode":"personal|general|blended","intent":"technical_experience|opinion|advice|personal_fact|general_question|project_question|other","topics":["..."],"retrieval_queries":["..."],"needs_personal_memory":true,"needs_general_knowledge":true,"personal_claims_must_be_verified":true,"should_surface_resources":false,"confidence":0.0}`,
  },
  { role: "user", content: query },
];

export const parseQueryUnderstanding = (raw: string): QueryUnderstanding | null => {
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return null;
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (!VALID_MODES.has(parsed.mode as UnderstandingMode) ||
      !VALID_INTENTS.has(parsed.intent as SemanticIntent)) return null;

    return {
      mode: parsed.mode as UnderstandingMode,
      intent: parsed.intent as SemanticIntent,
      topics: cleanStrings(parsed.topics, 6),
      retrievalQueries: cleanStrings(parsed.retrieval_queries, 5),
      needsPersonalMemory: parsed.needs_personal_memory === true,
      needsGeneralKnowledge: parsed.needs_general_knowledge === true,
      personalClaimsMustBeVerified: parsed.personal_claims_must_be_verified === true,
      shouldSurfaceResources: parsed.should_surface_resources === true,
      confidence: clampConfidence(parsed.confidence),
    };
  } catch (_error) {
    return null;
  }
};

const cleanStrings = (value: unknown, limit: number): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, limit).map((item) => item.trim())
    : [];

const clampConfidence = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : 0;

export const buildFallbackUnderstanding = (
  scope: "personal" | "general",
  intent: string,
): QueryUnderstanding => {
  const opinionLike = intent === "engineering_opinion" || intent === "hypothetical" || intent === "preference";
  const personal = scope === "personal";
  return {
    mode: opinionLike ? "blended" : personal ? "personal" : "general",
    intent: opinionLike ? "opinion" : personal ? "technical_experience" : "general_question",
    topics: [],
    retrievalQueries: [],
    needsPersonalMemory: personal || opinionLike,
    needsGeneralKnowledge: !personal || opinionLike,
    personalClaimsMustBeVerified: personal,
    shouldSurfaceResources: false,
    confidence: 0.35,
  };
};
