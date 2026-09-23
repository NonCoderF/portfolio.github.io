import type { ResourceCard } from "../resources/resourceResolver.ts";
import { normalizeQuery } from "../retrieval/queryNormalizer.ts";
import {
  formatDisplayDate,
  resolveTemporalState,
  type TemporalFact,
} from "../temporal/temporalFacts.ts";

export type TemporalAnswer = {
  reply: string;
  resources: ResourceCard[];
};

const employmentResource: ResourceCard = {
  type: "experience",
  id: "vantage-circle",
  title: "Vantage Circle",
  subtitle: "Former Senior Android Engineer",
};

const currentStatusResource: ResourceCard = {
  type: "biography",
  id: "current-status",
  title: "Current Status",
};

export const getTemporalAnswer = (query: string): TemporalAnswer | null => {
  const normalized = normalizeQuery(query);
  const resolved = resolveTemporalState(query);
  const latestFormer = resolved.latestFormerEmployment;
  const currentStatus = resolved.currentStatus;

  switch (resolved.intent) {
    case "current_employment":
      if (!resolved.currentEmployment && latestFormer?.endDate && currentStatus) {
        if (/\b(still working|still at vantage circle|still working at vantage circle)\b/.test(normalized)) {
          return {
            reply:
              `No. I left Vantage Circle on ${formatDisplayDate(latestFormer.endDate)} after working there as a Senior Android Engineer.`,
            resources: [employmentResource, currentStatusResource],
          };
        }

        return {
          reply:
            `I previously worked at Vantage Circle as a Senior Android Engineer until ${formatDisplayDate(latestFormer.endDate)}. I am currently focused on building open-source and AI-driven engineering projects while exploring my next opportunity.`,
          resources: [employmentResource, currentStatusResource],
        };
      }
      return null;
    case "previous_employment":
      if (latestFormer?.endDate) {
        return {
          reply:
            `I previously worked at Vantage Circle as a Senior Android Engineer, with my last working day on ${formatDisplayDate(latestFormer.endDate)}.`,
          resources: [employmentResource],
        };
      }
      return null;
    case "employment_end_date":
      if (latestFormer?.endDate) {
        return {
          reply: `My last working day at Vantage Circle was ${formatDisplayDate(latestFormer.endDate)}.`,
          resources: [employmentResource],
        };
      }
      return null;
    case "current_activity":
      if (currentStatus) {
        return {
          reply:
            "I am currently focused on open-source Android tooling, AI-driven products, ArchGuard, SonicBridge, and improving my digital twin while exploring my next engineering opportunity.",
          resources: [currentStatusResource],
        };
      }
      return null;
    case "latest_state":
      if (latestFormer?.endDate) {
        return {
          reply:
            `My latest job was Senior Android Engineer at Vantage Circle, where my last working day was ${formatDisplayDate(latestFormer.endDate)}. Since then, I have been focused on open-source Android tooling, AI-driven products, ArchGuard, SonicBridge, and my next engineering opportunity.`,
          resources: [employmentResource, currentStatusResource],
        };
      }
      return null;
    case "employment_history":
      return {
        reply:
          "My professional Android journey includes early roles at KBG Software and Geekworkx Technologies, followed by my Senior Android Engineer role at Vantage Circle. Vantage Circle is a former employer, not my current employer.",
        resources: [employmentResource],
      };
    case "employment_start_date":
      return answerStartDate(latestFormer);
    case "general":
      return null;
  }
};

const answerStartDate = (fact: TemporalFact | null): TemporalAnswer | null => {
  if (!fact?.startDate) {
    return null;
  }

  return {
    reply: `I joined Vantage Circle in ${fact.startDate}.`,
    resources: [employmentResource],
  };
};
