import { chooseAnswerMode, type AnswerMode } from "../answers/answerMode.ts";
import type { KnowledgeChunk } from "../knowledge/fileIndex.ts";
import { detectIntent } from "../retrieval/intentDetector.ts";
import { detectQueryScope, type QueryScope } from "../retrieval/queryScope.ts";
import { retrieveResumeSections } from "../resume/resumeRetriever.ts";
import type { ResumeSection } from "../resume/types.ts";
import {
  CURRENT_DATE,
  formatDisplayDate,
  resolveTemporalState,
  type TemporalFact,
} from "../temporal/temporalFacts.ts";
import { PERSONA_PROMPT } from "./persona.ts";
import type { QueryUnderstanding } from "../retrieval/queryUnderstanding.ts";
import type { EvidenceConnection } from "../retrieval/evidenceSelector.ts";

export type BuiltPrompt = {
  systemPrompt: string;
  resumeSections: ResumeSection[];
  memories: ResumeSection[];
  isPersonalQuestion: boolean;
  scope: QueryScope;
  intent: string;
  subtype?: string;
  answerMode: AnswerMode;
  knowledgeChunks: KnowledgeChunk[];
  estimatedTokens: number;
};

export const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

const resumeGroundingInstruction = `
You are the digital version of Nizamuddin Ali Ahmed.
Answer in first person.
The retrieved knowledge is factual truth.
Use only the supplied resume/story sections, retrieved file context, and temporal context for personal facts.
Facts may have time boundaries.
Always respect start dates, end dates, status, and is_current fields.
Never describe a former employer, completed project, expired role, or past state as current.
For questions containing "currently," "now," "today," "still," "latest," or "present," prefer records explicitly marked current or ongoing.
Do not assume that the most recently mentioned employer is the current employer.
If no active employment record exists, say that clearly and then mention the latest former role and current documented focus.
Do not mention a resume, profile, database, section, prompt, or retrieval.
Do not invent courses, institutions, mentors, certifications, companies, employers, dates, metrics, projects, technologies, birthplace, current location, or personal experience.
Do not fabricate a current employer.
If a concrete personal fact or claimed lived experience is not present in the supplied sections, say that I haven't shared that detail.
Do not use that disclaimer for engineering opinions, technical analysis, recommendations, or hypothetical decisions. Synthesize those directly from my verified background and broad technical knowledge.
For general technical questions with no supplied sections, answer normally as a helpful technical assistant.
`.trim();

const formatSection = (section: ResumeSection): string =>
  `## ${section.title}\n${section.content}`;

const formatChunk = (chunk: KnowledgeChunk): string =>
  `## ${chunk.title ?? chunk.id} (${chunk.source})\n${chunk.content}`;

const formatTemporalFact = (fact: TemporalFact): string => [
  `subject=${fact.subject}`,
  `predicate=${fact.predicate}`,
  `value=${fact.value}`,
  fact.startDate ? `start_date=${fact.startDate}` : undefined,
  fact.endDate ? `end_date=${fact.endDate} (${formatDisplayDate(fact.endDate)})` : undefined,
  `status=${fact.status}`,
  fact.isCurrent !== undefined ? `is_current=${String(fact.isCurrent)}` : undefined,
  `source=${fact.source}`,
].filter(Boolean).join("; ");

export function buildSystemPrompt(
  userPrompt: string,
  options: { retry?: boolean; temporalRepair?: boolean; claimRepair?: string[]; synthesisRepair?: string[]; knowledgeChunks?: KnowledgeChunk[]; evidenceConnections?: EvidenceConnection[]; understanding?: QueryUnderstanding | null } = {},
): BuiltPrompt {
  const detected = detectIntent(userPrompt);
  const temporal = resolveTemporalState(userPrompt);
  const scope = options.understanding
    ? options.understanding.mode === "general" ? "general" : "personal"
    : detected.intent === "general" ? detectQueryScope(userPrompt) : "personal";
  const resumeSections = options.understanding
    ? []
    : retrieveResumeSections(userPrompt);
  const contextCount = resumeSections.length + (options.knowledgeChunks?.length ?? 0);
  const answerMode = options.understanding?.mode === "blended"
    ? "persona_reasoning"
    : options.understanding?.mode === "general"
    ? "grounded_synthesis"
    : options.understanding?.mode === "personal"
    ? contextCount > 0 ? "verified" : "unknown"
    : chooseAnswerMode(scope, detected, resumeSections, contextCount, userPrompt);
  const personalQuestion = scope === "personal";
  const promptParts = [
    PERSONA_PROMPT,
    resumeGroundingInstruction,
    `CURRENT QUESTION:\n${userPrompt}`,
    "QUESTION UNDERSTANDING:",
    [
      `QUERY SCOPE: ${scope}`,
      `INTENT: ${options.understanding?.intent ?? detected.intent}${detected.identitySubtype ? `/${detected.identitySubtype}` : ""}`,
      `ANSWER MODE: ${answerMode}`,
      options.understanding ? `UNDERSTOOD TOPICS: ${options.understanding.topics.join(", ") || "none"}` : "",
      options.understanding ? `PERSONAL MEMORY NEEDED: ${String(options.understanding.needsPersonalMemory)}` : "",
      options.understanding ? `GENERAL KNOWLEDGE NEEDED: ${String(options.understanding.needsGeneralKnowledge)}` : "",
      options.understanding ? `PERSONAL CLAIMS MUST BE VERIFIED: ${String(options.understanding.personalClaimsMustBeVerified)}` : "",
      options.understanding?.contextDependent ? `CONTEXTUAL RESOLUTION: ${options.understanding.resolvedQuestion || userPrompt}` : "",
      options.understanding?.activeTopic ? `ACTIVE TOPIC: ${options.understanding.activeTopic}` : "",
      options.understanding?.references?.length
        ? `RESOLVED REFERENCES: ${options.understanding.references.map((reference) => `${reference.phrase} -> ${reference.meaning}`).join(" | ")}`
        : "",
    ].join("\n"),
  ];

  if (options.retry) {
    promptParts.push(
      "REPAIR INSTRUCTION: The previous draft sounded generic or refused a personal answer incorrectly. Use the supplied context directly, answer in first person, and avoid generic learning advice or AI disclaimers.",
    );
  }

  if (options.understanding?.contextDependent && options.understanding.resolvedQuestion) {
    promptParts.push(
      "CONTEXT RESOLUTION INSTRUCTION: Treat the standalone resolved question above as the meaning of the user's follow-up. Answer that meaning directly; do not ask the user to restate obvious references. Keep historical facts grounded, but freely provide predictions, comparisons, and present engineering judgment based on verified experience.",
    );
  }

  promptParts.push(
    "<personal_claim_rules>Historical claims about what Nizam did, built, used, experienced, worked on, believed, or preferred MUST be supported by the verified evidence below. General technical knowledge and future or hypothetical reasoning may go beyond it, but must not be rewritten as personal history. If the evidence does not support a claimed past experience, say so naturally.</personal_claim_rules>",
  );

  if (options.temporalRepair) {
    promptParts.push(
      "TEMPORAL REPAIR INSTRUCTION: The draft contains a temporal contradiction. Vantage Circle is a former employer. The last working day was 8 May 2026. Rewrite the answer accurately in first person.",
    );
  }

  if (options.claimRepair?.length) {
    promptParts.push(
      `CLAIM REPAIR: The previous draft made unsupported personal claims: ${options.claimRepair.join(" | ")}. Remove or qualify those claims. You may still provide useful general reasoning and may connect it only to experience explicitly present in the evidence.`,
    );
  }

  if (options.synthesisRepair?.length) {
    promptParts.push(
      `EXPERIENCE SYNTHESIS REPAIR: The previous draft did not materially reason from the selected experience: ${options.synthesisRepair.join(" | ")}. Rewrite it as one natural engineering answer. Transfer concrete lessons, constraints, failure modes, or trade-offs from the evidence into the proposed solution. Do not merely mention the project, append a credential, or default to a generic tutorial checklist. Keep past experience distinct from what I would do now.`,
    );
  }

  if (answerMode === "persona_reasoning" && contextCount === 0) {
    promptParts.push(
      "PERSONA FALLBACK: No exact answer was found in Nizam's files. Answer as Nizam using his known personality, career history, projects, technical interests, communication style, and professional values. This is allowed because the question concerns an opinion, preference, motivation, personality trait, or hypothetical situation. Do not invent concrete biographical facts or historical events.",
    );
  }

  if (answerMode === "persona_reasoning") {
    promptParts.push(
      "PROFESSIONAL JUDGMENT MODE: Give a direct first-person answer by combining Nizam's verified engineering perspective with broad model knowledge. The exact opinion does not need to be stored verbatim. Do not begin by saying the opinion was not shared. Do not claim hands-on experience that the supplied context does not confirm.",
    );
  }

  if (options.understanding?.mode === "blended") {
    promptParts.push(
      "EXPERIENCE-INFORMED BLENDED ANSWER: Answer the actual question first. Use the selected verified experience to influence how I frame risks, priorities, trade-offs, and the order of attack. Then reason beyond that experience using broad model knowledge. Make one coherent answer; do not bolt a memory summary onto a generic tutorial. Clearly distinguish what I actually did from what I would do now. Prefer concrete engineering judgment over a textbook checklist. Never turn analogy into invented history.",
      "INTERNAL SYNTHESIS: Before answering, silently identify which verified experience transfers, what lesson it provides, what is different about the new problem, and what additional general knowledge is needed. Use that synthesis to form the answer, but never expose these internal steps or chain-of-thought.",
      "STYLE FOR DESIGN AND OPINION QUESTIONS: Open with a direct judgment or starting point. Explain why, connect naturally to relevant experience, discuss the main trade-offs and failure modes, and give a concrete direction. Use numbered steps only when sequence genuinely improves clarity; do not default to an article-style checklist.",
      contextCount > 0
        ? "EVIDENCE UTILIZATION REQUIREMENT: The selected experience must visibly change the substance of the answer. Apply its concrete engineering decisions, real failure modes, constraints, trade-offs, or lessons to the new problem. A generic solution followed by 'this uses my experience' is not acceptable. Prefer a connected explanation over a numbered tutorial."
        : "EVIDENCE UTILIZATION: No relevant personal evidence was selected, so reason usefully from broad knowledge without inventing experience.",
    );
  } else if (options.understanding?.mode === "general") {
    promptParts.push(
      "GENERAL ANSWER: Use broad model knowledge, answer directly in Nizam's practical voice, and explain the idea in plain language.",
    );
  } else if (options.understanding?.mode === "personal") {
    promptParts.push(
      contextCount > 0
        ? "PERSONAL ANSWER: Answer factual claims about Nizam only from the evidence below. Relevant evidence can confirm experience; it does not authorize adjacent experience that is not stated."
        : "NO VERIFIED EVIDENCE: Retrieval found no reliable personal evidence for this request. Say naturally that I cannot claim that specific experience. If useful, continue with general knowledge, but do not turn it into my history.",
    );
  }

  if (options.evidenceConnections?.length) {
    promptParts.push(
      "WHY THE SELECTED EXPERIENCE MATTERS:",
      options.evidenceConnections.map((connection) =>
        `- [${connection.evidenceId}] ${connection.relevance}: ${connection.informsReasoning}${
          connection.transferableLessons.length
            ? `\n  Transferable lessons:\n${connection.transferableLessons.map((lesson) => `  - ${lesson}`).join("\n")}`
            : ""
        }`
      ).join("\n"),
    );
  }

  if (resumeSections.length > 0) {
    promptParts.push(
      resumeSections.length === 1 ? "SUPPLIED RESUME/STORY SECTION:" : "SUPPLIED RESUME/STORY SECTIONS:",
      resumeSections.map(formatSection).join("\n\n"),
    );
  }

  if (options.knowledgeChunks && options.knowledgeChunks.length > 0) {
    promptParts.push(
      "VERIFIED RELEVANT NIZAM EXPERIENCE:",
      "<verified_personal_evidence>",
      options.knowledgeChunks.map(formatChunk).join("\n\n"),
      "</verified_personal_evidence>",
    );
  }

  promptParts.push(
    "TEMPORAL CONTEXT:",
    [
      `QUESTION: ${userPrompt}`,
      `TEMPORAL INTENT: ${temporal.intent}`,
      `CURRENT DATE: ${CURRENT_DATE}`,
      `ACTIVE FACTS: ${temporal.facts.filter((fact) => fact.isCurrent === true && fact.status !== "former").map(formatTemporalFact).join(" | ") || "none"}`,
      `FORMER FACTS: ${temporal.facts.filter((fact) => fact.status === "former").map(formatTemporalFact).join(" | ") || "none"}`,
      `CURRENT STATUS: ${temporal.currentStatus ? formatTemporalFact(temporal.currentStatus) : "none"}`,
    ].join("\n"),
  );

  const systemPrompt = promptParts.join("\n\n");

  return {
    systemPrompt,
    resumeSections,
    memories: resumeSections,
    isPersonalQuestion: personalQuestion,
    scope,
    intent: options.understanding?.intent ?? detected.intent,
    subtype: detected.identitySubtype,
    answerMode,
    knowledgeChunks: options.knowledgeChunks ?? [],
    estimatedTokens: estimateTokens(systemPrompt),
  };
}
