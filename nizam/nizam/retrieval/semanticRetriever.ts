import { retrieveKnowledgeChunks, type KnowledgeChunk } from "../knowledge/fileIndex.ts";
import type { QueryUnderstanding } from "./queryUnderstanding.ts";

const MAX_RESULTS = 8;

export type SemanticRetrievalResult = {
  chunks: KnowledgeChunk[];
  strategy: "semantic_terms" | "none";
  semanticQuery: string;
  diagnostics: RetrievalDiagnostic[];
};

export type RetrievalDiagnostic = {
  id: string;
  title?: string;
  score: number | null;
  contentPreview: string;
};

/** Local-only retrieval. The final model, not this function, decides meaning and relevance. */
export const retrieveSemanticKnowledge = async (
  _apiKey: string | undefined,
  question: string,
  understanding: QueryUnderstanding,
): Promise<SemanticRetrievalResult> => {
  if (!understanding.needsPersonalMemory) {
    return { chunks: [], strategy: "none", semanticQuery: "", diagnostics: [] };
  }

  const semanticQuery = [
    understanding.resolvedQuestion || question,
    ...understanding.topics,
    ...understanding.retrievalQueries,
    ...(understanding.discussedConcepts ?? []),
  ].filter(Boolean).join("\n");
  const chunks = await retrieveKnowledgeChunks(
    semanticQuery,
    [...understanding.topics, ...understanding.retrievalQueries, ...(understanding.discussedConcepts ?? [])],
    MAX_RESULTS,
  );
  return {
    chunks,
    strategy: "semantic_terms",
    semanticQuery,
    diagnostics: chunks.map((chunk, index) => diagnosticFor(chunk, Math.max(0, 1 - index / MAX_RESULTS))),
  };
};

const diagnosticFor = (chunk: KnowledgeChunk, score: number | null): RetrievalDiagnostic => ({
  id: chunk.id,
  title: chunk.title,
  score: score === null ? null : Math.round(score * 10000) / 10000,
  contentPreview: chunk.content.replace(/\s+/g, " ").slice(0, 220),
});

export const cosineSimilarity = (left: number[], right: number[]): number => {
  if (left.length === 0 || left.length !== right.length) return 0;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  return leftNorm && rightNorm ? dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm)) : 0;
};
