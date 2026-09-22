import type { QueryScope } from "../retrieval/queryScope.ts";
import { resolveTemporalState } from "../temporal/temporalFacts.ts";

export const FORBIDDEN_PERSONAL_PATTERNS = [
  /i don'?t have a specific experience/i,
  /i'?m afraid i can'?t provide/i,
  /i am afraid i (can'?t|cannot) provide/i,
  /as an ai/i,
  /many people often/i,
  /there are plenty of resources/i,
  /if you'?re interested.*i can help/i,
  /if you are interested.*i can help/i,
  /i don'?t have personal experiences/i,
  /i haven'?t shared my (specific )?(thoughts|opinion|view)/i,
  /i have not shared my (specific )?(thoughts|opinion|view)/i,
  /i'?m not sure where i was born/i,
  /i cannot recall/i,
  /i don'?t recall/i,
];

export type ValidationResult = {
  ok: boolean;
  reason?: string;
  kind?: "personal" | "temporal";
};

export const validatePersonalAnswer = (
  scope: QueryScope,
  answer: string,
  query = "",
): ValidationResult => {
  if (scope !== "personal") {
    return { ok: true };
  }

  const temporal = validateTemporalAccuracy(query, answer);
  if (!temporal.ok) {
    return temporal;
  }

  const matched = FORBIDDEN_PERSONAL_PATTERNS.find((pattern) => pattern.test(answer));

  if (matched) {
    return {
      ok: false,
      reason: matched.source,
      kind: "personal",
    };
  }

  return { ok: true };
};

export const TEMPORAL_CONTRADICTIONS = [
  /currently work at Vantage Circle/i,
  /I work at Vantage Circle/i,
  /my current employer is Vantage Circle/i,
  /I am currently employed by Vantage Circle/i,
  /still working at Vantage Circle/i,
  /I'?m still at Vantage Circle/i,
  /I am still at Vantage Circle/i,
];

export const validateTemporalAccuracy = (
  query: string,
  answer: string,
): ValidationResult => {
  const resolved = resolveTemporalState(query);
  const vantageIsFormer = resolved.facts.some((fact) =>
    fact.predicate === "employment" &&
    fact.value.toLowerCase().includes("vantage circle") &&
    fact.status === "former" &&
    fact.isCurrent === false
  );

  if (!vantageIsFormer) {
    return { ok: true };
  }

  const contradiction = TEMPORAL_CONTRADICTIONS.find((pattern) => pattern.test(answer));
  if (contradiction) {
    return {
      ok: false,
      reason: contradiction.source,
      kind: "temporal",
    };
  }

  if (
    resolved.intent === "current_employment" &&
    /vantage circle/i.test(answer) &&
    !/\b(previously worked|former|left|last working day|until|no longer)\b/i.test(answer)
  ) {
    return {
      ok: false,
      reason: "current_employment_answer_mentions_former_employer_without_temporal_boundary",
      kind: "temporal",
    };
  }

  if (
    resolved.intent === "current_activity" &&
    /\b(completed|finished)\b/i.test(answer) &&
    /\b(archguard|sonicbridge|ai-driven|open-source|open source)\b/i.test(answer)
  ) {
    return {
      ok: false,
      reason: "current_activity_described_as_completed",
      kind: "temporal",
    };
  }

  if (
    /\bshockwave\b/i.test(answer) &&
    /\b(completed|launched|built and shipped|finished)\b/i.test(answer)
  ) {
    return {
      ok: false,
      reason: "planned_project_described_as_completed",
      kind: "temporal",
    };
  }

  return { ok: true };
};
