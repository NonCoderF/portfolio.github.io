import type { KnowledgeChunk } from "../knowledge/fileIndex.ts";
import { callOpenAIChat, type OpenAIMessage } from "../openaiClient.ts";
import type { QueryUnderstanding } from "./queryUnderstanding.ts";

export type EvidenceConnection = {
  evidenceId: string;
  relevance: "direct" | "analogical";
  informsReasoning: string;
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
): Promise<EvidenceSelection> => {
  if (!understanding.needsPersonalMemory || candidates.length === 0) {
    return { chunks: [], connections: [], strategy: "none" };
  }

  if (!apiKey) {
    return { chunks: candidates.slice(0, 3), connections: [], strategy: "retrieval_order" };
  }

  const result = await callOpenAIChat(
    apiKey,
    buildEvidenceSelectionMessages(question, understanding, candidates),
    320,
    0,
  );
  if (!result.ok) {
    return { chunks: candidates.slice(0, 3), connections: [], strategy: "retrieval_order" };
  }

  const parsed = parseEvidenceSelection(result.message, candidates);
  return parsed ?? { chunks: candidates.slice(0, 3), connections: [], strategy: "retrieval_order" };
};

export const buildEvidenceSelectionMessages = (
  question: string,
  understanding: QueryUnderstanding,
  candidates: KnowledgeChunk[],
): OpenAIMessage[] => [
  {
    role: "system",
    content: `Select only verified Nizam evidence that materially helps answer the current question.

For personal factual questions, select evidence that directly supports the requested claim.
For blended questions, evidence may be directly relevant or analogically relevant: it should change how an experienced Nizam would reason about the new problem, not merely share a broad technology word.
Reject background that would only decorate a generic answer.
Do not infer new history. Describe how evidence informs present reasoning without claiming Nizam built the new system.
Return JSON only:
{"selected_ids":["id"],"connections":[{"evidence_id":"id","relevance":"direct|analogical","informs_reasoning":"short concrete explanation"}]}
Select at most 3 items. Empty selection is valid.`,
  },
  {
    role: "user",
    content: `QUESTION:\n${question}\n\nMODE: ${understanding.mode}\nINTENT: ${understanding.intent}\nTOPICS: ${understanding.topics.join(", ")}\n\nCANDIDATE VERIFIED EVIDENCE:\n${candidates.map(formatCandidate).join("\n\n")}`,
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
  `[${chunk.id}] ${chunk.title ?? chunk.category}\n${chunk.content.slice(0, 1400)}`;
