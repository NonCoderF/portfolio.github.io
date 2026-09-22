import type { KnowledgeChunk } from "../knowledge/fileIndex.ts";
import type { OpenAIMessage } from "../openaiClient.ts";
import type { ResumeSection } from "../resume/types.ts";

export type ClaimVerification = {
  supported: boolean;
  unsupportedClaims: string[];
  experienceInformed: boolean;
  synthesisFeedback: string[];
};

export const buildClaimVerificationMessages = (
  question: string,
  answer: string,
  resumeSections: ResumeSection[],
  chunks: KnowledgeChunk[],
  requireExperienceTransfer = false,
): OpenAIMessage[] => [
  {
    role: "system",
    content: `Verify first-person factual claims about Nizam's real identity, history, experience, projects, past preferences, and completed actions. General technical reasoning, present-day opinions, proposals, and hypothetical future actions do not require evidence. "I would", "I'd", "I would probably", and similar descriptions of what he proposes doing now are NOT historical claims and must never be rejected merely because he has not done that exact action before. A statement that he has not built an exact system is safe when no evidence confirms it.

Return JSON only: {"supported":true|false,"unsupported_claims":["..."],"experience_informed":true|false,"synthesis_feedback":["..."]}.
Mark supported=false only when a past/present factual claim such as "I built", "I used", "I implemented", "I worked on", "I experienced", or equivalent lacks direct support in VERIFIED EVIDENCE. Do not accept merely related experience as proof of the exact historical claim.

When EXPERIENCE TRANSFER REQUIRED is true, also judge whether the answer materially applies concrete decisions, failures, constraints, trade-offs, or lessons from the verified evidence to the new problem. Merely mentioning experience or ending with a credential is insufficient. Hypothetical reasoning can extend beyond evidence. Set experience_informed=false and give concise synthesis_feedback when the answer remains a generic tutorial, fails to transfer concrete lessons, blurs historical experience with a proposal, or inaccurately presents an inference/deployment runtime as the training framework. When transfer is not required, set experience_informed=true.`,
  },
  {
    role: "user",
    content: `QUESTION:\n${question}\n\nEXPERIENCE TRANSFER REQUIRED: ${String(requireExperienceTransfer)}\n\nANSWER:\n${answer}\n\nVERIFIED EVIDENCE:\n${formatEvidence(resumeSections, chunks)}`,
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
      experienceInformed: typeof parsed.experience_informed === "boolean"
        ? parsed.experience_informed
        : true,
      synthesisFeedback: Array.isArray(parsed.synthesis_feedback)
        ? parsed.synthesis_feedback.filter((item): item is string => typeof item === "string").slice(0, 5)
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
