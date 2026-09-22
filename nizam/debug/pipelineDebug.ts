export type PipelineDebugStage =
  | "knowledge_initialization"
  | "router"
  | "semantic_retrieval_query"
  | "raw_retrieval_results"
  | "reranked_personal_evidence"
  | "accepted_personal_evidence"
  | "final_generation_context"
  | "resource_selection";

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
