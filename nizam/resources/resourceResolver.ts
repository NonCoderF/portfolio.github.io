import { normalizeQuery } from "../retrieval/queryNormalizer.ts";
import type { ResumeResourceRef } from "../resume/types.ts";

export type ResourceType =
  | "identity"
  | "project"
  | "experience"
  | "article"
  | "biography"
  | "education"
  | "skills";

export type ResourceCard = {
  type: ResourceType;
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
};

type ResourceDefinition = ResourceCard & {
  memoryIds?: string[];
  keywords: string[];
  relatedKnowledgeIds?: string[];
  semanticTopics?: string[];
};

type ResourceSource = {
  id: string;
  resources?: ResumeResourceRef[];
};

export type ResourceRelevanceDiagnostic = {
  id: string;
  score: number;
  matchedEvidenceIds: string[];
  matchedTopics: string[];
  selected: boolean;
};

export type SemanticResourceSelection = {
  resources: ResourceCard[];
  diagnostics: ResourceRelevanceDiagnostic[];
};

const RESOURCES: ResourceDefinition[] = [
  {
    type: "identity",
    id: "profile",
    title: "Nizamuddin Ali Ahmed",
    subtitle: "Senior Android Engineer",
    memoryIds: ["resume-identity", "identity-summary"],
    keywords: ["who are you", "tell me about yourself", "name", "identity"],
  },
  {
    type: "identity",
    id: "date-of-birth",
    title: "Date of Birth",
    subtitle: "11 April 1993",
    memoryIds: ["identity-dob"],
    keywords: ["date of birth", "birthday", "dob", "when were you born"],
  },
  {
    type: "identity",
    id: "birthplace",
    title: "Birthplace",
    subtitle: "Verified birthplace",
    memoryIds: ["identity-birthplace"],
    keywords: ["birthplace", "place of birth"],
  },
  {
    type: "biography",
    id: "career-transition",
    title: "Career Transition",
    subtitle: "Self-taught path from Mechanical Engineering to Android engineering",
    memoryIds: ["biography-career-transition", "resume-career-story"],
    keywords: [
      "self-taught",
      "career transition",
      "coding journey",
      "developer journey",
      "android developer",
    ],
  },
  {
    type: "project",
    id: "adaptive-exercise-recognition",
    title: "Adaptive Exercise Recognition",
    subtitle: "On-device pose, TensorFlow Lite, validation, and anti-cheat engineering",
    memoryIds: ["projects-2"],
    relatedKnowledgeIds: ["projects-2"],
    semanticTopics: ["computer vision", "pose detection", "activity recognition", "on-device ml", "tensorflow lite", "movement recognition"],
    keywords: ["adaptive exercise recognition", "exercise recognition", "squat detection", "tensorflow lite", "tflite", "pose detection", "on-device ml"],
  },
  {
    type: "project",
    id: "archguard",
    title: "ArchGuard",
    subtitle: "Kotlin Gradle plugin for executable architecture rules",
    url: "https://github.com/NonCoderF/ArchGuard",
    memoryIds: ["project-archguard", "project-summary", "resume-projects"],
    relatedKnowledgeIds: ["projects-3", "project-archguard"],
    semanticTopics: ["software architecture", "modularization", "feature-first architecture", "architecture enforcement", "gradle plugin"],
    keywords: ["archguard", "architecture rules", "gradle plugin"],
  },
  {
    type: "project",
    id: "sonicbridge",
    title: "SonicBridge",
    subtitle: "Android TV audio streaming over local Wi-Fi",
    url: "https://github.com/NonCoderF/Sonic-Bridge",
    memoryIds: ["project-sonicbridge", "project-summary", "resume-projects"],
    relatedKnowledgeIds: ["projects-4", "project-sonicbridge"],
    semanticTopics: ["tcp networking", "local networking", "audio streaming", "android tv", "network reliability"],
    keywords: ["sonicbridge", "sonic bridge", "audio streaming", "android tv"],
  },
  {
    type: "project",
    id: "tapori-ai",
    title: "Tapori AI",
    subtitle: "Android AI chatbot app",
    url: "https://play.google.com/store/apps/details?id=com.sparkstudios.tapori.ai.chatbot",
    memoryIds: ["project-tapori-ai", "project-summary", "resume-projects"],
    relatedKnowledgeIds: ["projects-5", "project-tapori-ai"],
    semanticTopics: ["ai product", "openai integration", "android ai"],
    keywords: ["tapori ai", "tapori", "ai chatbot"],
  },
  {
    type: "project",
    id: "biometric-sdk",
    title: "Biometric SDK",
    subtitle: "Reusable Android biometric authentication SDK",
    url: "https://github.com/NonCoderF/biometric-sdk",
    memoryIds: ["project-biometric-sdk", "project-summary", "resume-projects"],
    relatedKnowledgeIds: ["projects-6", "project-biometric-sdk"],
    semanticTopics: ["biometric authentication", "sdk design", "fingerprint authentication"],
    keywords: ["biometric sdk", "biometric", "fingerprint", "face authentication"],
  },
  {
    type: "project",
    id: "orhan",
    title: "Orhan Project",
    subtitle: "Public portfolio project with limited shared details",
    memoryIds: ["project-orhan", "project-summary", "resume-projects"],
    relatedKnowledgeIds: ["projects-7", "project-orhan"],
    keywords: ["orhan", "orhan project"],
  },
  {
    type: "project",
    id: "sally-launcher",
    title: "Sally Launcher",
    subtitle: "Custom Android launcher exploration",
    memoryIds: ["project-sally-launcher", "project-summary", "resume-projects"],
    relatedKnowledgeIds: ["projects-8", "project-sally-launcher"],
    semanticTopics: ["android launcher", "platform experience"],
    keywords: ["sally launcher", "sally", "launcher"],
  },
  {
    type: "experience",
    id: "vantage-circle",
    title: "Vantage Circle",
    subtitle: "Senior Android Engineer work on enterprise Android apps",
    memoryIds: ["experience-vantage-circle", "career-summary", "resume-experience"],
    relatedKnowledgeIds: ["experience-4", "experience-vantage-circle"],
    semanticTopics: ["legacy modernization", "mvp", "mvvm", "jetpack compose", "modularization"],
    keywords: ["vantage circle", "vc"],
  },
  {
    type: "experience",
    id: "geekworkx-technologies",
    title: "Geekworkx Technologies",
    subtitle: "Android engineering growth before senior-level work",
    memoryIds: ["experience-geekworkx", "career-summary", "resume-experience"],
    keywords: ["geekworkx", "geekworkx technologies"],
  },
  {
    type: "experience",
    id: "kbg-software",
    title: "KBG Software",
    subtitle: "Early professional Android journey",
    memoryIds: ["experience-kbg", "career-summary", "resume-experience"],
    keywords: ["kbg", "kbg software"],
  },
  {
    type: "article",
    id: "subtitle-algorithm",
    title: "Subtitle Algorithm",
    subtitle: "Algorithmic handling of subtitle timing and text",
    memoryIds: ["article-subtitle-algorithm", "article-writing", "resume-articles"],
    keywords: ["subtitle algorithm", "subtitle", "subtitles"],
  },
  {
    type: "article",
    id: "in-app-updates",
    title: "In-App Updates",
    subtitle: "Android app update flows and distribution",
    memoryIds: ["article-in-app-updates", "article-writing", "resume-articles"],
    keywords: ["in-app updates", "in app updates", "android app updates"],
  },
  {
    type: "article",
    id: "plug-and-play-biometric-system",
    title: "Plug-and-Play Biometric System",
    subtitle: "Reusable biometric authentication integration",
    memoryIds: ["article-biometric-system", "article-writing", "project-biometric-sdk", "resume-articles"],
    keywords: ["plug-and-play biometric", "plug and play biometric", "biometric system"],
  },
  {
    type: "article",
    id: "pyaar-ka-algorithm",
    title: "Pyaar Ka Algorithm",
    subtitle: "Algorithmic thinking explained in a relatable style",
    memoryIds: ["article-pyaar-ka-algorithm", "article-writing", "resume-articles"],
    keywords: ["pyaar ka algorithm", "pyaar"],
  },
  {
    type: "education",
    id: "mechanical-engineering",
    title: "Mechanical Engineering",
    subtitle: "Bachelor of Engineering, Royal School of Engineering and Technology",
    memoryIds: ["education-mechanical-engineering", "identity-education", "biography-origin", "resume-education"],
    keywords: [
      "qualification",
      "qualifications",
      "mechanical engineering",
      "education",
      "study",
      "studied",
      "degree",
      "college",
      "university",
      "academic background",
      "highest qualification",
    ],
  },
  {
    type: "skills",
    id: "android",
    title: "Android Engineering",
    subtitle: "Kotlin, Java, Android SDK, Compose, Material3, platform APIs",
    memoryIds: ["skills-android", "resume-skills"],
    keywords: ["android skills", "android", "kotlin", "compose", "material3"],
  },
  {
    type: "skills",
    id: "architecture",
    title: "Architecture",
    subtitle: "MVVM, modularization, SDK design, architecture automation",
    memoryIds: ["skills-architecture", "resume-skills"],
    keywords: ["architecture skills", "clean architecture", "mvvm", "modularization"],
  },
  {
    type: "skills",
    id: "build-tooling",
    title: "Build Tooling",
    subtitle: "Gradle plugins, DSLs, build automation, developer tools",
    memoryIds: ["skills-build-tooling", "resume-skills"],
    keywords: ["build tooling", "gradle", "developer tools", "automation"],
  },
];

export const resolveRelevantResources = (
  query: string,
  topics: string[],
  memories: ResourceSource[],
): ResourceCard[] => {
  const semanticText = normalizeQuery([query, ...topics].join(" "));
  const memoryIds = new Set(memories.map((memory) => memory.id));
  const exactMatches = RESOURCES.filter((resource) =>
    resource.keywords.some((keyword) => semanticText.includes(normalizeQuery(keyword)))
  );
  const supportedMatches = exactMatches.filter((resource) =>
    !resource.memoryIds?.length || resource.memoryIds.some((id) => memoryIds.has(id))
  );
  return uniqueResources(supportedMatches.length ? supportedMatches : exactMatches)
    .slice(0, 2)
    .map(stripInternalFields);
};

export const selectEvidenceBackedResources = (
  topics: string[],
  evidence: ResourceSource[],
): SemanticResourceSelection => {
  const evidenceIds = new Set(evidence.map((item) => item.id));
  const normalizedTopics = topics.map(normalizeQuery);
  const diagnostics = RESOURCES.flatMap((resource): ResourceRelevanceDiagnostic[] => {
    const matchedEvidenceIds = (resource.relatedKnowledgeIds ?? []).filter((id) => evidenceIds.has(id));
    if (matchedEvidenceIds.length === 0) return [];
    const matchedTopics = (resource.semanticTopics ?? []).filter((topic) => {
      const normalized = normalizeQuery(topic);
      return normalizedTopics.some((queryTopic) => queryTopic === normalized);
    });
    const score = Math.min(1, 0.72 + matchedTopics.length * 0.07);
    return [{
      id: resource.id,
      score: Math.round(score * 100) / 100,
      matchedEvidenceIds,
      matchedTopics,
      selected: false,
    }];
  }).sort((left, right) => right.score - left.score);

  const winner = diagnostics.find((candidate) => candidate.score >= 0.79);
  if (!winner) return { resources: [], diagnostics };
  winner.selected = true;
  const resource = RESOURCES.find((candidate) => candidate.id === winner.id);
  return {
    resources: resource ? [stripInternalFields(resource)] : [],
    diagnostics,
  };
};

export const resolveResources = (
  query: string,
  memories: ResourceSource[],
  includeQueryMatches = false,
): ResourceCard[] => {
  const normalizedQuery = normalizeQuery(query);
  const memoryIds = new Set(memories.map((memory) => memory.id));
  const explicitResources = new Set(
    memories.flatMap((memory) => memory.resources ?? [])
      .map((resource) => `${resource.type}:${resource.id}`),
  );
  const selected = RESOURCES.filter((resource) =>
    explicitResources.has(`${resource.type}:${resource.id}`) ||
    resource.memoryIds?.some((memoryId) => memoryIds.has(memoryId)) ||
    (includeQueryMatches &&
      resource.keywords.some((keyword) => normalizedQuery.includes(normalizeQuery(keyword))))
  );

  const unique = uniqueResources(selected).map(stripInternalFields);

  if (/\b(favorite project|favourite project|most proud|proud of|proud project)\b/.test(normalizedQuery)) {
    return unique.filter((resource) =>
      resource.type !== "project" || resource.id === "archguard"
    );
  }

  if (/\barchguard\b/.test(normalizedQuery)) {
    return unique.filter((resource) =>
      resource.type !== "project" || resource.id === "archguard"
    );
  }

  if (/\bwhy (android|kotlin)\b|\bwhy do you like kotlin\b|\bwhat kind of engineer\b/.test(normalizedQuery)) {
    return unique.filter((resource) =>
      resource.type === "skills" || resource.type === "biography"
    );
  }

  if (/\bwhat would you do\b|\bif .* failed\b|\bif .* fails\b/.test(normalizedQuery)) {
    return unique.filter((resource) =>
      resource.type === "skills" || resource.type === "biography"
    );
  }

  return unique;
};

const uniqueResources = (resources: ResourceDefinition[]): ResourceDefinition[] => {
  const seen = new Set<string>();

  return resources.filter((resource) => {
    const key = `${resource.type}:${resource.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const stripInternalFields = (
  resource: ResourceDefinition,
): ResourceCard => {
  const { memoryIds: _memoryIds, keywords: _keywords, ...card } = resource;
  return card;
};
