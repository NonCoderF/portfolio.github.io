export type ResumeIntent =
  | "identity"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "articles"
  | "careerStory"
  | "achievements"
  | "mission"
  | "goals"
  | "general";

export type ResumeResourceType =
  | "identity"
  | "education"
  | "experience"
  | "project"
  | "skills"
  | "article"
  | "biography";

export type ResumeResourceRef = {
  type: ResumeResourceType;
  id: string;
};

export type ResumeSection = {
  id: string;
  intent: ResumeIntent;
  title: string;
  keywords: string[];
  phrases?: string[];
  content: string;
  resources?: ResumeResourceRef[];
  priority?: number;
};

export type ParsedResume = {
  identity: {
    name: string;
    preferredName: string;
    profession: string;
    experience: string;
    dateOfBirth: string;
    dayOfBirth: string;
    birthplace?: string;
    hometown: string;
    nationality: string;
  };
  education: {
    degree: string;
    institution: string;
    period: string;
    academicProjects: string[];
  };
  experience: Array<{
    company: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    status?: "current" | "former" | "unknown";
    isCurrent?: boolean;
    summary: string;
    highlights?: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    summary: string;
    url?: string;
    favorite?: boolean;
  }>;
  skills: string[];
  articles: Array<{
    id: string;
    title: string;
    summary: string;
  }>;
  careerStory: string;
  achievements: string[];
  mission: string;
  goals: string;
};
