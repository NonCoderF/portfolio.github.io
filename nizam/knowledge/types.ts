export type KnowledgeType =
  | "project"
  | "experience"
  | "skill"
  | "preference"
  | "fact";

export interface KnowledgeRecord {
  id: string;
  source: string;
  category: string;
  type: KnowledgeType;
  title?: string;
  content: string;
  topics: string[];
  keywords: string[];
  verified: true;
  priority?: number;
}
