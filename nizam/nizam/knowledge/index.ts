import { identityKnowledge } from "./identityKnowledge.ts";
import { personaKnowledge } from "./personaKnowledge.ts";
import { professionalKnowledge } from "./professionalKnowledge.ts";
import { projectKnowledge } from "./projectKnowledge.ts";
import type { KnowledgeRecord } from "./types.ts";
import { writingKnowledge } from "./writingKnowledge.ts";

export const CORE_KNOWLEDGE_IDS = [
  "projects-2", // Adaptive Exercise Recognition
  "projects-3", // ArchGuard
  "projects-4", // SonicBridge / networking
  "experience-4", // Vantage Circle / architecture, Compose and modularization
  "skills-1",
] as const;

export const NIZAM_KNOWLEDGE: KnowledgeRecord[] = [
  ...identityKnowledge,
  ...professionalKnowledge,
  ...projectKnowledge,
  ...writingKnowledge,
  ...personaKnowledge,
];

validateKnowledge(NIZAM_KNOWLEDGE);

function validateKnowledge(records: KnowledgeRecord[]): void {
  if (records.length === 0) throw new Error("Digital Nizam knowledge is empty.");

  const ids = new Set<string>();
  for (const record of records) {
    if (!record.id || !record.category || !record.type || !record.content.trim() || !record.title?.trim()) {
      throw new Error(`Digital Nizam knowledge contains an incomplete record: ${record.id || "unknown"}`);
    }
    if (record.verified !== true) throw new Error(`Digital Nizam knowledge is not verified: ${record.id}`);
    if (ids.has(record.id)) throw new Error(`Digital Nizam knowledge contains a duplicate ID: ${record.id}`);
    ids.add(record.id);
  }

  const missing = CORE_KNOWLEDGE_IDS.filter((id) => !ids.has(id));
  if (missing.length) throw new Error(`Digital Nizam knowledge is missing core records: ${missing.join(", ")}`);
}
