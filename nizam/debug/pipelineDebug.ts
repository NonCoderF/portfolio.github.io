export type PipelineDebugStage =
  | "knowledge_initialization"
  | "router"
  | "semantic_retrieval_query"
  | "raw_retrieval_results"
  | "reranked_personal_evidence"
  | "accepted_personal_evidence"
  | "final_generation_context"
  | "resource_selection";

export type PerformanceTrace = {
  startedAt: number;
  stages: Record<string, number>;
  llmCalls: Array<{ purpose: string; model: string; inputChars: number; maxOutputTokens: number }>;
  embeddingCalls: Array<{ purpose: string; inputCount: number; inputChars: number }>;
};

export const createPerformanceTrace = (): PerformanceTrace => ({
  startedAt: performance.now(),
  stages: {},
  llmCalls: [],
  embeddingCalls: [],
});

export const addPerformanceStage = (trace: PerformanceTrace, name: string, startedAt: number): void => {
  trace.stages[name] = Math.round((performance.now() - startedAt) * 100) / 100;
};

export const logPerformanceTrace = (requestId: string, trace: PerformanceTrace, extra: Record<string, unknown> = {}): void => {
  if (!isPipelineDebugEnabled()) return;
  const totalRequestMs = Math.round((performance.now() - trace.startedAt) * 100) / 100;
  const accounted = Object.values(trace.stages).reduce((sum, value) => sum + value, 0);
  console.log(JSON.stringify({
    type: "digital_nizam_performance",
    requestId,
    trace: {
      totalRequestMs,
      ...trace.stages,
      otherMs: Math.max(0, Math.round((totalRequestMs - accounted) * 100) / 100),
      numberOfLLMCalls: trace.llmCalls.length,
      numberOfEmbeddingCalls: trace.embeddingCalls.length,
      llmCalls: trace.llmCalls,
      embeddingCalls: trace.embeddingCalls,
      ...extra,
    },
  }));
  console.log(`PERFORMANCE TRACE | Context/router: ${Math.round(trace.stages.contextResolutionMs ?? 0)} ms | Embedding: ${Math.round(trace.stages.embeddingMs ?? 0)} ms | Retrieval: ${Math.round(trace.stages.retrievalMs ?? 0)} ms | Reranking: ${Math.round(trace.stages.rerankingMs ?? 0)} ms | Prompt assembly: ${Math.round(trace.stages.promptAssemblyMs ?? 0)} ms | Generation: ${Math.round(trace.stages.finalGenerationMs ?? 0)} ms | Resource selection: ${Math.round(trace.stages.resourceSelectionMs ?? 0)} ms | Other: ${Math.round(Math.max(0, totalRequestMs - accounted))} ms | TOTAL: ${Math.round(totalRequestMs)} ms | LLM calls: ${trace.llmCalls.length} | Embedding calls: ${trace.embeddingCalls.length}`);
};

export const isPipelineDebugEnabled = (): boolean =>
  Deno.env.get("DIGITAL_NIZAM_DEBUG") === "true" ||
  Deno.env.get("ENVIRONMENT") === "development" ||
  Deno.env.get("DENO_ENV") === "development";

export const logPipelineDebug = (
  requestId: string,
  stage: PipelineDebugStage,
  payload: Record<string, unknown>,
): void => {
  if (!isPipelineDebugEnabled()) return;
  console.log(JSON.stringify({
    type: "digital_nizam_pipeline",
    requestId,
    stage,
    payload,
  }));
};

export const createPipelineRequestId = (): string => crypto.randomUUID();
