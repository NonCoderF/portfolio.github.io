import type { KnowledgeChunk } from "../knowledge/fileIndex.ts";
import { callOpenAIChat, type OpenAIMessage, type RemoteCallMetrics } from "../openaiClient.ts";
import type { QueryUnderstanding } from "./queryUnderstanding.ts";
import { normalizeQuery, tokenize } from "./queryNormalizer.ts";

export type EvidenceConnection = {
  evidenceId: string;
  relevance: "direct" | "analogical";
  informsReasoning: string;
  transferableLessons: string[];
};

export type EvidenceSelection = {
  chunks: KnowledgeChunk[];
  connections: EvidenceConnection[];
  strategy: "semantic_rerank" | "retrieval_order" | "none";
};

export const selectRelevantEvidence = async (
  apiKey: string | undefined,
  question: string,
  understanding: QueryUnderstanding,
  candidates: KnowledgeChunk[],
  metrics?: RemoteCallMetrics,
): Promise<EvidenceSelection> => {
  if (!understanding.needsPersonalMemory || candidates.length === 0) {
    return { chunks: [], connections: [], strategy: "none" };
  }

  if (!apiKey) {
    return { chunks: fallbackEvidence(candidates, understanding), connections: [], strategy: "retrieval_order" };
  }

  const result = await callOpenAIChat(
    apiKey,
    buildEvidenceSelectionMessages(question, understanding, candidates),
    320,
    0,
    { ...metrics, purpose: "evidence_reranking" },
  );
  if (!result.ok) {
    return { chunks: fallbackEvidence(candidates, understanding), connections: [], strategy: "retrieval_order" };
  }

  const parsed = parseEvidenceSelection(result.message, candidates);
  return parsed ?? { chunks: fallbackEvidence(candidates, understanding), connections: [], strategy: "retrieval_order" };
};

const fallbackEvidence = (
  candidates: KnowledgeChunk[],
  understanding: QueryUnderstanding,
): KnowledgeChunk[] => {
  const reasoningIntent = understanding.mode === "blended" ||
    understanding.intent === "solution_design" ||
    understanding.intent === "advice" ||
    understanding.intent === "opinion";
  const useful = reasoningIntent
    ? candidates.filter((chunk) => !["conversation", "faq", "privacy", "identity"].includes(chunk.category))
    : candidates;
  const pool = useful.length ? useful : candidates;
  const activeIds = new Set(understanding.activeEvidenceIds ?? []);
  const contextText = normalizeQuery([
    understanding.activeTopic ?? "",
    ...(understanding.discussedConcepts ?? []),
    ...(understanding.topics ?? []),
    ...(understanding.retrievalQueries ?? []),
  ].join(" "));
  const contextTokens = new Set(tokenize(contextText));
  return pool.map((chunk, index) => {
    const candidateTokens = new Set(tokenize(normalizeQuery([
      chunk.title ?? "", chunk.category, ...(chunk.topics ?? []), ...(chunk.keywords ?? []), chunk.content,
    ].join(" "))));
    const overlap = [...contextTokens].filter((token) => candidateTokens.has(token)).length;
    return { chunk, score: (activeIds.has(chunk.id) ? 1000 : 0) + overlap * 10 - index / 100 };
  }).sort((a, b) => b.score - a.score).slice(0, 3).map(({ chunk }) => chunk);
};

export const buildEvidenceSelectionMessages = (
  question: string,
  understanding: QueryUnderstanding,
  candidates: KnowledgeChunk[],
): OpenAIMessage[] => [
  {
    role: "system",
    content: `Select only verified Nizam evidence that materially helps answer the current question.

Rank against the RESOLVED QUESTION, ACTIVE TOPIC, RECENT CONCEPTS, and PRIOR VERIFIED EVIDENCE together. The active topic is a strong contextual relevance signal: when a specific project or module is being discussed, prefer evidence describing that project's concrete failures and decisions over broad employer or technology background that only shares generic words. Prior evidence is a contextual prior, not a permanent filter; follow a clear topic change. Prefer the most specific candidate that answers the resolved subject, and do not select unrelated background merely because it matches a generic word such as "problems" or "experience".

For personal factual questions, select evidence that directly supports the requested claim.
For blended questions, evidence may be directly relevant or analogically relevant: it should change how an experienced Nizam would reason about the new problem, not merely share a broad technology word.
Reject background that would only decorate a generic answer. For selected evidence, extract 1-4 concrete transferable lessons from decisions, failures, constraints, trade-offs, edge cases, or debugging experience stated in that evidence. Do not return generic shared-technology descriptions as lessons.
Do not infer new history. Describe how evidence informs present reasoning without claiming Nizam built the new system.
Return JSON only:
{"selected_ids":["id"],"connections":[{"evidence_id":"id","relevance":"direct|analogical","informs_reasoning":"short concrete explanation","transferable_lessons":["concrete lesson"]}]}
Select at most 3 items. Empty selection is valid.`,
  },
  {
    role: "user",
    content: `RESOLVED QUESTION:\n${question}\n\nMODE: ${understanding.mode}\nINTENT: ${understanding.intent}\nACTIVE TOPIC: ${understanding.activeTopic || "none"}\nRECENT CONCEPTS: ${(understanding.discussedConcepts ?? []).join(", ") || "none"}\nTOPICS: ${understanding.topics.join(", ")}\nPRIOR VERIFIED EVIDENCE (a contextual prior, not a lock): ${(understanding.activeEvidenceIds ?? []).join(", ") || "none"}\n\nCANDIDATE VERIFIED EVIDENCE:\n${candidates.map(formatCandidate).join("\n\n")}`,
  },
];

export const parseEvidenceSelection = (
  raw: string,
  candidates: KnowledgeChunk[],
): EvidenceSelection | null => {
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return null;
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const candidateMap = new Map(candidates.map((chunk) => [chunk.id, chunk]));
    const selectedIds = Array.isArray(parsed.selected_ids)
      ? parsed.selected_ids.filter((id): id is string => typeof id === "string" && candidateMap.has(id)).slice(0, 3)
      : [];
    const selectedSet = new Set(selectedIds);
    const connections = Array.isArray(parsed.connections)
      ? parsed.connections.flatMap((item): EvidenceConnection[] => {
        if (!item || typeof item !== "object") return [];
        const value = item as Record<string, unknown>;
        if (typeof value.evidence_id !== "string" || !selectedSet.has(value.evidence_id) ||
          (value.relevance !== "direct" && value.relevance !== "analogical") ||
          typeof value.informs_reasoning !== "string") return [];
        return [{
          evidenceId: value.evidence_id,
          relevance: value.relevance,
          informsReasoning: value.informs_reasoning.trim().slice(0, 300),
          transferableLessons: Array.isArray(value.transferable_lessons)
            ? value.transferable_lessons.filter((lesson): lesson is string =>
              typeof lesson === "string" && lesson.trim().length > 0
            ).slice(0, 4).map((lesson) => lesson.trim().slice(0, 240))
            : [],
        }];
      })
      : [];
    return {
      chunks: selectedIds.map((id) => candidateMap.get(id)!),
      connections,
      strategy: "semantic_rerank",
    };
  } catch (_error) {
    return null;
  }
};

const formatCandidate = (chunk: KnowledgeChunk): string =>
  `[${chunk.id}] title=${chunk.title ?? ""}; category=${chunk.category}; type=${chunk.type}; topics=${chunk.topics.join(", ")}; keywords=${chunk.keywords.join(", ")}; verified=${String(chunk.verified)}\n${chunk.content.slice(0, 1800)}`;
