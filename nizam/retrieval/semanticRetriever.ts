import { buildKnowledgeIndex, retrieveKnowledgeChunks, type KnowledgeChunk } from "../knowledge/fileIndex.ts";
import { callOpenAIEmbeddings, type RemoteCallMetrics } from "../openaiClient.ts";
import type { QueryUnderstanding } from "./queryUnderstanding.ts";

const MAX_RESULTS = 10;
const MIN_SIMILARITY = 0.3;
let cachedChunkEmbeddings: Promise<{ chunks: KnowledgeChunk[]; vectors: number[][] } | null> | null = null;

export type SemanticRetrievalResult = {
  chunks: KnowledgeChunk[];
  strategy: "embedding" | "semantic_terms" | "none";
  semanticQuery: string;
  diagnostics: RetrievalDiagnostic[];
  embeddingMs?: number;
};

export type RetrievalDiagnostic = {
  id: string;
  title?: string;
  score: number | null;
  contentPreview: string;
};

export const retrieveSemanticKnowledge = async (
  apiKey: string | undefined,
  question: string,
  understanding: QueryUnderstanding,
  metrics?: RemoteCallMetrics,
): Promise<SemanticRetrievalResult> => {
  if (!understanding.needsPersonalMemory) {
    return { chunks: [], strategy: "none", semanticQuery: "", diagnostics: [] };
  }

  const semanticQuery = [understanding.resolvedQuestion || question, ...understanding.topics, ...understanding.retrievalQueries,
    ...(understanding.discussedConcepts ?? [])].filter(Boolean).join("\n");
  if (apiKey) {
    const embeddingStartedAt = performance.now();
    const [index, queryEmbedding] = await Promise.all([
      getEmbeddingIndex(apiKey, metrics),
      callOpenAIEmbeddings(apiKey, [semanticQuery], { ...metrics, purpose: "query_embedding" }),
    ]);
    const embeddingMs = Math.round((performance.now() - embeddingStartedAt) * 100) / 100;
    if (index && queryEmbedding.ok) {
      const activeIds = new Set(understanding.activeEvidenceIds ?? []);
      const rankedWithScores = index.chunks.map((chunk, indexPosition) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding.embeddings[0], index.vectors[indexPosition]),
      })).filter(({ score }) => score >= MIN_SIMILARITY)
        .sort((a, b) => b.score - a.score || (b.chunk.priority ?? 0) - (a.chunk.priority ?? 0))
      const activeCandidates = index.chunks
        .filter((chunk) => activeIds.has(chunk.id) && !rankedWithScores.some((candidate) => candidate.chunk.id === chunk.id))
        .map((chunk) => ({ chunk, score: 0 }));
      const rankedWithActive = [...activeCandidates, ...rankedWithScores];
      if (rankedWithActive.length > 0) {
        const ordered = (activeIds.size
          ? [...rankedWithActive].sort((a, b) => Number(activeIds.has(b.chunk.id)) - Number(activeIds.has(a.chunk.id)))
          : rankedWithActive).slice(0, MAX_RESULTS);
        return {
          chunks: ordered.map(({ chunk }) => chunk),
          strategy: "embedding",
          semanticQuery,
          embeddingMs,
          diagnostics: ordered.map(({ chunk, score }) => diagnosticFor(chunk, score)),
        };
      }
    }
  }

  const fallback = await retrieveKnowledgeChunks(
    understanding.resolvedQuestion || question,
    [...understanding.topics, ...understanding.retrievalQueries, ...(understanding.discussedConcepts ?? [])],
    MAX_RESULTS,
  );
  return {
    chunks: fallback,
    strategy: "semantic_terms",
    semanticQuery,
    diagnostics: fallback.map((chunk) => diagnosticFor(chunk, null)),
  };
};

const diagnosticFor = (chunk: KnowledgeChunk, score: number | null): RetrievalDiagnostic => ({
  id: chunk.id,
  title: chunk.title,
  score: score === null ? null : Math.round(score * 10000) / 10000,
  contentPreview: chunk.content.replace(/\s+/g, " ").slice(0, 220),
});

const getEmbeddingIndex = async (
  apiKey: string,
  metrics?: RemoteCallMetrics,
): Promise<{ chunks: KnowledgeChunk[]; vectors: number[][] } | null> => {
  if (!cachedChunkEmbeddings) {
    cachedChunkEmbeddings = (async () => {
      const chunks = await buildKnowledgeIndex();
      const inputs = chunks.map((chunk) =>
        [chunk.title, chunk.category, chunk.keywords.join(", "), chunk.content].filter(Boolean).join("\n").slice(0, 2400)
      );
      const result = await callOpenAIEmbeddings(apiKey, inputs, { purpose: "knowledge_index_embeddings", ...metrics });
      return result.ok ? { chunks, vectors: result.embeddings } : null;
    })();
  }
  return cachedChunkEmbeddings;
};

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
