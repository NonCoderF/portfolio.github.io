import { normalizeQuery } from "../retrieval/queryNormalizer.ts";

export type TemporalStatus =
  | "current"
  | "former"
  | "ongoing"
  | "completed"
  | "planned"
  | "unknown";

export type TemporalFact = {
  subject: string;
  predicate: string;
  value: string;
  startDate?: string;
  endDate?: string;
  status: TemporalStatus;
  isCurrent?: boolean;
  source: string;
};

export type TemporalIntent =
  | "current_employment"
  | "previous_employment"
  | "employment_history"
  | "employment_end_date"
  | "employment_start_date"
  | "current_activity"
  | "latest_state"
  | "general";

export type TemporalResolution = {
  intent: TemporalIntent;
  currentEmployment: TemporalFact | null;
  latestFormerEmployment: TemporalFact | null;
  currentStatus: TemporalFact | null;
  facts: TemporalFact[];
};

export const CURRENT_DATE = "2026-07-25";
export const VANTAGE_CIRCLE_LAST_WORKING_DAY = "2026-05-08";

export const TEMPORAL_FACTS: TemporalFact[] = [
  {
    subject: "Nizamuddin Ali Ahmed",
    predicate: "employment",
    value: "Vantage Circle | Senior Android Engineer",
    startDate: "2020-07",
    endDate: VANTAGE_CIRCLE_LAST_WORKING_DAY,
    status: "former",
    isCurrent: false,
    source: "knowledge/experience.md#vantage-circle",
  },
  {
    subject: "Nizamuddin Ali Ahmed",
    predicate: "current_status",
    value:
      "No longer employed at Vantage Circle. Focused on open-source Android and developer tools, ArchGuard, SonicBridge, AI-driven products, improving the digital twin, and exploring new Android engineering opportunities.",
    startDate: "2026-05-09",
    status: "current",
    isCurrent: true,
    source: "knowledge/current-status.md",
  },
];

export const detectTemporalIntent = (query: string): TemporalIntent => {
  const normalized = normalizeQuery(query);

  if (/\b(when did you leave|last working day|left vantage circle|leave vantage circle|end date)\b/.test(normalized)) {
    return "employment_end_date";
  }

  if (/\b(when did you join|when did you start|start date|joined vantage circle)\b/.test(normalized)) {
    return "employment_start_date";
  }

  if (
    /\b(where do you work|where are you working|current company|current employer|current job|do you currently have an employer|currently employed|still working|still at vantage circle)\b/.test(normalized)
  ) {
    return "current_employment";
  }

  if (/\b(what are you doing now|what are you currently doing|what are you currently building|what are you building now|doing right now|present focus|current focus)\b/.test(normalized)) {
    return "current_activity";
  }

  if (/\b(previous company|previous employer|where did you work previously|where have you worked previously|former employer)\b/.test(normalized)) {
    return "previous_employment";
  }

  if (/\b(latest job|latest role|latest state|latest career state)\b/.test(normalized)) {
    return "latest_state";
  }

  if (/\b(work experience|employment history|career history|companies have you worked|where have you worked)\b/.test(normalized)) {
    return "employment_history";
  }

  return "general";
};

export const resolveCurrentEmployment = (
  facts: TemporalFact[],
): TemporalFact | null =>
  facts.find((fact) =>
    fact.predicate === "employment" &&
    fact.status === "current" &&
    fact.isCurrent === true &&
    !fact.endDate
  ) ?? null;

export const findLatestFormerEmployment = (
  facts: TemporalFact[],
): TemporalFact | null =>
  facts
    .filter((fact) =>
      fact.predicate === "employment" &&
      fact.status === "former" &&
      fact.endDate
    )
    .sort((a, b) => compareIsoDatesDescending(a.endDate!, b.endDate!))[0] ?? null;

export const findCurrentStatus = (
  facts: TemporalFact[],
): TemporalFact | null =>
  facts
    .filter((fact) =>
      fact.predicate === "current_status" &&
      (fact.status === "current" || fact.status === "ongoing") &&
      fact.isCurrent === true
    )
    .sort((a, b) => compareIsoDatesDescending(a.startDate ?? "", b.startDate ?? ""))[0] ?? null;

export const resolveTemporalState = (
  query: string,
  facts: TemporalFact[] = TEMPORAL_FACTS,
): TemporalResolution => ({
  intent: detectTemporalIntent(query),
  currentEmployment: resolveCurrentEmployment(facts),
  latestFormerEmployment: findLatestFormerEmployment(facts),
  currentStatus: findCurrentStatus(facts),
  facts,
});

export const formatDisplayDate = (isoDate: string): string => {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return isoDate;
  }

  const [, year, month, day] = match;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = Number(month) - 1;

  return `${Number(day)} ${monthNames[monthIndex]} ${year}`;
};

const compareIsoDatesDescending = (left: string, right: string): number =>
  isoDateToTime(right) - isoDateToTime(left);

const isoDateToTime = (value: string): number => {
  const normalized = value.length === 7 ? `${value}-01` : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return 0;
  }

  const [year, month, day] = normalized.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};
