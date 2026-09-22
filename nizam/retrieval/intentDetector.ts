import { normalizeQuery } from "./queryNormalizer.ts";

export type DetectedIntent = {
  intent:
    | "identity"
    | "education"
    | "biography"
    | "careerStory"
    | "projects"
    | "experience"
    | "skills"
    | "articles"
    | "achievements"
    | "motivation"
    | "goals"
    | "preference"
    | "engineering_opinion"
    | "personality"
    | "hypothetical"
    | "general";
  isPersonalQuestion: boolean;
  identitySubtype?: IdentitySubtype;
};

export type IdentitySubtype =
  | "name"
  | "age"
  | "date_of_birth"
  | "birthplace"
  | "hometown"
  | "nationality"
  | "location";

const personalFramePatterns = [
  /\bhave you used\b/,
  /\bdid you use\b/,
  /\bdid you work with\b/,
  /\bhave you worked with\b/,
  /\bdo you know\b/,
  /\byour experience with\b/,
  /\bdid you build\b/,
  /\bwhat do you think\b/,
  /\bwhat is your opinion\b/,
  /\bare you familiar with\b/,
];

export const detectIntent = (query: string): DetectedIntent => {
  const normalized = normalizeQuery(query);
  const hasPersonalFrame = personalFramePatterns.some((pattern) => pattern.test(normalized)) ||
    /\b(you|your|yourself|nizam|nizamuddin|ali ahmed)\b/.test(normalized);
  const isGeneralLearningAdvice = /\bhow can i learn\b|\bhow do i learn\b|\bhow should i learn\b/.test(normalized);

  if (isGeneralLearningAdvice) {
    return {
      intent: "general",
      isPersonalQuestion: false,
    };
  }

  const identitySubtype = detectIdentitySubtype(normalized);
  const isBiography = isPersonalCodingJourneyQuery(query);
  const isEducation = /\b(qualification|qualifications|degree|education|study|studied|graduation|college|university|mechanical engineering)\b/.test(normalized) ||
    /\bacademic background\b/.test(normalized);
  const isExperience = /\b(experience|company|companies|current job|worked|work at|vantage circle|geekworkx|kbg|tensorflow lite|tflite|squat detection|exercise recognition)\b/.test(normalized);
  const isProjects = /\b(project|projects|favorite project|proud project|archguard|sonicbridge|tapori|biometric sdk|orhan|sally launcher|shockwave)\b/.test(normalized);
  const isSkills = /\b(skills|skill|tech stack|technologies)\b/.test(normalized) ||
    (hasPersonalFrame && /\b(kotlin|java|android sdk|compose|gradle|architecture|modularization|coroutines|flow)\b/.test(normalized));
  const isArticles = /\b(article|articles|blog|blogs|written|medium|subtitle|in-app updates|pyaar ka algorithm)\b/.test(normalized);
  const isAchievements = /\b(achievement|achievements|accomplishment|impact|proud of)\b/.test(normalized);
  const isMotivation = /\b(mission|motivates|motivation|values|purpose|why android|why kotlin|why do you like|why did you build)\b/.test(normalized);
  const isGoals = /\b(goals|goal|future|dream|direction)\b/.test(normalized);
  const isPreference = /\b(prefer|preference|would you choose|startup|large company|favorite|favourite)\b/.test(normalized);
  const isPersonality = /\b(how do you handle pressure|handle pressure|kind of leader|leader are you|leadership|teammate|work habits|personality|describe yourself|what do you value)\b/.test(normalized);
  const isEngineeringOpinion = /\b(what kind of engineer|kind of engineer|engineering opinion|what do you think|how do you think|approach|trade[- ]?off|why do you like kotlin|why kotlin|why android)\b/.test(normalized);
  const isHypothetical = /\bwhat would you do\b|\bif .* failed\b|\bif .* fails\b|\bwould you\b/.test(normalized);

  return {
    intent: identitySubtype
      ? "identity"
      : isBiography
      ? "biography"
      : isEducation
      ? "education"
      : isExperience
      ? "experience"
      : isHypothetical
      ? "hypothetical"
      : isEngineeringOpinion
      ? "engineering_opinion"
      : isProjects
      ? "projects"
      : isSkills
      ? "skills"
      : isArticles
      ? "articles"
      : isAchievements
      ? "achievements"
      : isPreference
      ? "preference"
      : isPersonality
      ? "personality"
      : isMotivation
      ? "motivation"
      : isGoals
      ? "goals"
      : "general",
    identitySubtype,
    isPersonalQuestion: hasPersonalFrame || identitySubtype !== undefined || isBiography || isEducation || isExperience ||
      isProjects || isSkills || isArticles || isAchievements || isMotivation || isGoals ||
      isPreference || isPersonality || isEngineeringOpinion || isHypothetical,
  };
};

export const isPersonalQuestion = (query: string): boolean =>
  detectIntent(query).isPersonalQuestion;

export function isPersonalCodingJourneyQuery(query: string): boolean {
  const normalized = normalizeQuery(query);

  if (/\bhow can i learn (coding|programming)\b/.test(normalized)) {
    return false;
  }

  const personalPatterns = [
    /\bwhere did you learn (coding|programming)\b/,
    /\bhow did you learn (coding|programming)\b/,
    /\bwhere you learned (coding|programming)\b/,
    /\bwhere you learn (coding|programming)\b/,
    /\bhow you learned (coding|programming)\b/,
    /\bhow you learn (coding|programming)\b/,
    /\bwho taught you (coding|programming)\b/,
    /\bare you self[- ]taught\b/,
    /\byou are self[- ]taught\b/,
    /\bhow did you become (a |an )?(android developer|developer)\b/,
    /\bhow you become (a |an )?(android developer|developer)\b/,
    /\bhow did you start coding\b/,
    /\btell me about your (coding|developer|career) journey\b/,
    /\btell me about your career transition\b/,
    /\bwhy did you leave mechanical engineering\b/,
  ];

  return personalPatterns.some((pattern) => pattern.test(normalized));
}

const birthplacePatterns = [
  /\bwhere were you born\b/,
  /\bwhere you born\b/,
  /\bwhere are you born\b/,
  /\bwhere was you born\b/,
  /\bwhere did you born\b/,
  /\bwhat is your birthplace\b/,
  /\bwhat is your birth place\b/,
  /\byour birthplace\b/,
  /\bplace of birth\b/,
  /\bbirthplace\b/,
];

const detectIdentitySubtype = (normalizedQuery: string): IdentitySubtype | undefined => {
  if (
    /\b(when were you born|what is your birthday|when is your birthday|your birthday|date of birth|what is your date of birth|which date were you born)\b/.test(normalizedQuery)
  ) {
    return "date_of_birth";
  }

  if (birthplacePatterns.some((pattern) => pattern.test(normalizedQuery))) {
    return "birthplace";
  }

  if (/\bwhere are you from\b/.test(normalizedQuery) || /\bhometown\b/.test(normalizedQuery)) {
    return "hometown";
  }

  return undefined;
};
