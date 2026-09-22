import { buildKnowledgeIndex, retrieveKnowledgeChunks, type KnowledgeChunk } from "../knowledge/fileIndex.ts";
import { callOpenAIEmbeddings } from "../openaiClient.ts";
import type { QueryUnderstanding } from "./queryUnderstanding.ts";

const MAX_RESULTS = 5;
const MIN_SIMILARITY = 0.3;
let cachedChunkEmbeddings: Promise<{ chunks: KnowledgeChunk[]; vectors: number[][] } | null> | null = null;

export type SemanticRetrievalResult = {
  chunks: KnowledgeChunk[];
  strategy: "embedding" | "semantic_terms" | "none";
};

export const retrieveSemanticKnowledge = async (
  apiKey: string | undefined,
  question: string,
  understanding: QueryUnderstanding,
): Promise<SemanticRetrievalResult> => {
  if (!understanding.needsPersonalMemory) return { chunks: [], strategy: "none" };

  const semanticQuery = [question, ...understanding.topics, ...understanding.retrievalQueries].join("\n");
  if (apiKey) {
    const index = await getEmbeddingIndex(apiKey);
    const queryEmbedding = await callOpenAIEmbeddings(apiKey, [semanticQuery]);
    if (index && queryEmbedding.ok) {
      const ranked = index.chunks.map((chunk, indexPosition) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding.embeddings[0], index.vectors[indexPosition]),
      })).filter(({ score }) => score >= MIN_SIMILARITY)
        .sort((a, b) => b.score - a.score || (b.chunk.priority ?? 0) - (a.chunk.priority ?? 0))
        .slice(0, MAX_RESULTS)
        .map(({ chunk }) => chunk);
      if (ranked.length > 0) return { chunks: ranked, strategy: "embedding" };
    }
  }

  const fallback = await retrieveKnowledgeChunks(
    question,
    [...understanding.topics, ...understanding.retrievalQueries],
    MAX_RESULTS,
  );
  return { chunks: fallback, strategy: "semantic_terms" };
};

const getEmbeddingIndex = async (
  apiKey: string,
): Promise<{ chunks: KnowledgeChunk[]; vectors: number[][] } | null> => {
  if (!cachedChunkEmbeddings) {
    cachedChunkEmbeddings = (async () => {
      const chunks = await buildKnowledgeIndex();
      const inputs = chunks.map((chunk) =>
        [chunk.title, chunk.category, chunk.keywords.join(", "), chunk.content].filter(Boolean).join("\n").slice(0, 2400)
      );
      const result = await callOpenAIEmbeddings(apiKey, inputs);
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
