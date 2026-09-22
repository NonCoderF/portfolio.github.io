import type { KnowledgeChunk } from "../knowledge/fileIndex.ts";
import type { OpenAIMessage } from "../openaiClient.ts";
import type { ResumeSection } from "../resume/types.ts";

export type ClaimVerification = {
  supported: boolean;
  unsupportedClaims: string[];
};

export const buildClaimVerificationMessages = (
  question: string,
  answer: string,
  resumeSections: ResumeSection[],
  chunks: KnowledgeChunk[],
): OpenAIMessage[] => [
  {
    role: "system",
    content: `Verify only first-person factual claims about Nizam's real identity, history, experience, projects, past preferences, and actions. General technical reasoning and present-day opinions do not require evidence. A statement that he has not built an exact system is safe when no evidence confirms it.

Return JSON only: {"supported":true|false,"unsupported_claims":["..."]}.
Mark supported=false if the answer says or clearly implies "I built", "I used", "I implemented", "I worked on", "I experienced", or equivalent without direct support in VERIFIED EVIDENCE. Do not accept merely related experience as proof of the exact claim.`,
  },
  {
    role: "user",
    content: `QUESTION:\n${question}\n\nANSWER:\n${answer}\n\nVERIFIED EVIDENCE:\n${formatEvidence(resumeSections, chunks)}`,
  },
];

export const parseClaimVerification = (raw: string): ClaimVerification | null => {
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return null;
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (typeof parsed.supported !== "boolean") return null;
    return {
      supported: parsed.supported,
      unsupportedClaims: Array.isArray(parsed.unsupported_claims)
        ? parsed.unsupported_claims.filter((claim): claim is string => typeof claim === "string").slice(0, 5)
        : [],
    };
  } catch (_error) {
    return null;
  }
};

const formatEvidence = (sections: ResumeSection[], chunks: KnowledgeChunk[]): string => {
  const evidence = [
    ...sections.map((section) => `[${section.id}] ${section.content}`),
    ...chunks.map((chunk) => `[${chunk.id}] ${chunk.content}`),
  ];
  return evidence.length ? evidence.join("\n\n") : "NONE";
};
