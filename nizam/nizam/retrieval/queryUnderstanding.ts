import type { OpenAIMessage } from "../openaiClient.ts";

export type UnderstandingMode = "personal" | "general" | "blended";
export type SemanticIntent =
  | "technical_experience"
  | "opinion"
  | "advice"
  | "solution_design"
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
  contextDependent?: boolean;
  resolvedQuestion?: string;
  activeTopic?: string;
  references?: Array<{ phrase: string; meaning: string }>;
  activeEvidenceIds?: string[];
  discussedConcepts?: string[];
};

const VALID_MODES = new Set<UnderstandingMode>(["personal", "general", "blended"]);
const VALID_INTENTS = new Set<SemanticIntent>([
  "technical_experience", "opinion", "advice", "solution_design", "personal_fact",
  "general_question", "project_question", "other",
]);

export const buildUnderstandingMessages = (
  query: string,
  history: OpenAIMessage[] = [],
): OpenAIMessage[] => [
  {
    role: "system",
    content: `You are the semantic router for Digital Nizam. Understand meaning, not wording. Return one compact JSON object only; never answer the user.

Modes:
- personal: asks what Nizam actually did, used, built, experienced, prefers, or what is factually true about him.
- general: asks for knowledge that does not require Nizam's history.
- blended: asks for Nizam's present professional opinion, advice, design approach, or reasoning where his experience can ground a broader answer.

Unknown is not a mode. A request about unverified experience is still personal/technical_experience and must be searched before absence is concluded.

Intents: technical_experience, opinion, advice, solution_design, personal_fact, general_question, project_question, other.

topics: up to 6 normalized concepts. Resolve aliases and conceptual paraphrases. For example, questions about deploying mobile ML, on-device inference, activity classification, or exercise AI may include concepts such as Android, on-device ML, TensorFlow Lite, pose detection, or exercise recognition when semantically relevant.

retrieval_queries: 2-5 short semantic descriptions of evidence that would answer the question. Do not merely copy the sentence.

needs_personal_memory: true whenever Nizam's identity, history, experience, projects, preferences, or professional perspective matters.
needs_general_knowledge: true for explanations, recommendations, comparisons, opinions, designs, and new problem solving.
personal_claims_must_be_verified: true whenever the final answer could claim Nizam did, used, built, implemented, experienced, previously preferred, or worked on something.
should_surface_resources: true only when the user asks about a specific project/module, asks to see/open it, or a resource would materially support follow-up exploration. Retrieval alone is not a reason.
confidence: 0 to 1.

Contextual resolution:
- Use the recent conversation supplied below as meaning, not merely as text to append to an answer.
- Decide whether the current message is standalone or depends on the conversation.
- Resolve pronouns, ellipsis, comparisons, "same" concepts, and deictic references such as here/there/that into a standalone semantic question before choosing retrieval queries.
- Preserve semantic continuity with the latest active topic and evidence, but follow a clear topic switch.
- A prediction or engineering judgment grounded in verified past experience is blended, not an unsupported historical claim.
- If a reference is genuinely ambiguous, leave the resolved question conservative and lower confidence rather than inventing a referent.

Return these additional fields:
context_dependent: true only when the current message needs prior turns to be understood.
resolved_question: standalone semantic query for routing/retrieval; keep the original wording when standalone.
active_topic: concise current topic, or empty string.
references: [{"phrase":"...","meaning":"..."}] for resolved references only.
active_evidence_ids: evidence IDs explicitly present in the supplied active context, never invented.
discussed_concepts: up to 8 concepts carried forward from the current topic.

Schema:
{"mode":"personal|general|blended","intent":"technical_experience|opinion|advice|solution_design|personal_fact|general_question|project_question|other","topics":["..."],"retrieval_queries":["..."],"needs_personal_memory":true,"needs_general_knowledge":true,"personal_claims_must_be_verified":true,"should_surface_resources":false,"confidence":0.0,"context_dependent":false,"resolved_question":"...","active_topic":"...","references":[],"active_evidence_ids":[],"discussed_concepts":[]}`,
  },
  {
    role: "user",
    content: `CURRENT USER MESSAGE:\n${query}\n\nRECENT RELEVANT CONVERSATION (use only to resolve meaning):\n${formatHistory(history)}`,
  },
];

export const parseQueryUnderstanding = (raw: string): QueryUnderstanding | null => {
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return null;
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (!VALID_MODES.has(parsed.mode as UnderstandingMode) ||
      !VALID_INTENTS.has(parsed.intent as SemanticIntent)) return null;

    const parsedMode = parsed.mode as UnderstandingMode;
    const intent = parsed.intent as SemanticIntent;
    const mode: UnderstandingMode = parsedMode === "general" &&
        (intent === "solution_design" || intent === "advice" || intent === "opinion")
      ? "blended"
      : parsedMode;
    return {
      mode,
      intent,
      topics: cleanStrings(parsed.topics, 6),
      retrievalQueries: cleanStrings(parsed.retrieval_queries, 5),
      needsPersonalMemory: mode === "personal" || mode === "blended",
      needsGeneralKnowledge: mode === "general" || mode === "blended",
      personalClaimsMustBeVerified: mode !== "general" || parsed.personal_claims_must_be_verified === true,
      shouldSurfaceResources: parsed.should_surface_resources === true,
      confidence: clampConfidence(parsed.confidence),
      contextDependent: parsed.context_dependent === true,
      resolvedQuestion: typeof parsed.resolved_question === "string" && parsed.resolved_question.trim()
        ? parsed.resolved_question.trim().slice(0, 1600)
        : "",
      activeTopic: typeof parsed.active_topic === "string" ? parsed.active_topic.trim().slice(0, 240) : "",
      references: cleanReferences(parsed.references),
      activeEvidenceIds: cleanStrings(parsed.active_evidence_ids, 8),
      discussedConcepts: cleanStrings(parsed.discussed_concepts, 8),
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
    contextDependent: false,
    resolvedQuestion: "",
    activeTopic: "",
    references: [],
    activeEvidenceIds: [],
    discussedConcepts: [],
  };
};

const cleanReferences = (value: unknown): Array<{ phrase: string; meaning: string }> =>
  Array.isArray(value)
    ? value.flatMap((item): Array<{ phrase: string; meaning: string }> => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      return typeof record.phrase === "string" && typeof record.meaning === "string" &&
          record.phrase.trim() && record.meaning.trim()
        ? [{ phrase: record.phrase.trim().slice(0, 120), meaning: record.meaning.trim().slice(0, 500) }]
        : [];
    }).slice(0, 8)
    : [];

const formatHistory = (history: OpenAIMessage[]): string => {
  const recent = history.filter((message) => message.role === "user" || message.role === "assistant").slice(-6);
  return recent.length
    ? recent.map((message) => `${message.role.toUpperCase()}: ${message.content.slice(0, 1200)}`).join("\n")
    : "(none)";
};
