import { parseResume } from "./resumeParser.ts";
import type { ResumeSection } from "./types.ts";

let cachedIndex: ResumeSection[] | null = null;

export const buildResumeIndex = (): ResumeSection[] => {
  if (cachedIndex) {
    return cachedIndex;
  }

  const resume = parseResume();

  cachedIndex = [
    {
      id: "resume-identity",
      intent: "identity",
      title: "Identity",
      keywords: ["name", "who are you", "identity", "born", "birthday", "hometown", "nationality"],
      phrases: ["tell me about yourself", "who are you", "where are you from"],
      content: [
        `Name: ${resume.identity.name}.`,
        `Preferred name: ${resume.identity.preferredName}.`,
        `Profession: ${resume.identity.profession}.`,
        `Experience: ${resume.identity.experience}.`,
        `Date of birth: ${resume.identity.dateOfBirth}.`,
        `Day of birth: ${resume.identity.dayOfBirth}.`,
        `Birthplace: ${resume.identity.birthplace ?? "Not mentioned in the resume"}.`,
        `Hometown: ${resume.identity.hometown}.`,
        `Nationality: ${resume.identity.nationality}.`,
      ].join("\n"),
      resources: [{ type: "identity", id: "profile" }],
      priority: 100,
    },
    {
      id: "resume-education",
      intent: "education",
      title: "Education",
      keywords: ["qualification", "education", "degree", "college", "university", "academic", "study", "studied"],
      phrases: ["what is your qualification", "what did you study", "which college did you attend", "highest qualification"],
      content: [
        `Degree: ${resume.education.degree}.`,
        `Institution: ${resume.education.institution}.`,
        `Study period: ${resume.education.period}.`,
        `Academic projects: ${resume.education.academicProjects.join(", ")}.`,
      ].join("\n"),
      resources: [{ type: "education", id: "mechanical-engineering" }],
      priority: 100,
    },
    {
      id: "resume-experience",
      intent: "experience",
      title: "Experience",
      keywords: ["experience", "company", "companies", "current job", "worked", "work", "vantage circle", "geekworkx", "kbg"],
      phrases: ["what companies have you worked at", "current job", "where have you worked"],
      content: resume.experience.map((experience) =>
        [
          `Company: ${experience.company}.`,
          experience.role ? `Role: ${experience.role}.` : undefined,
          experience.startDate ? `Start date: ${experience.startDate}.` : undefined,
          experience.endDate ? `End date: ${experience.endDate}.` : undefined,
          experience.status ? `Status: ${experience.status}.` : undefined,
          experience.isCurrent !== undefined ? `Is current: ${String(experience.isCurrent)}.` : undefined,
          `Summary: ${experience.summary}`,
          experience.highlights?.length ? `Highlights: ${experience.highlights.join("; ")}.` : undefined,
        ].filter(Boolean).join("\n")
      ).join("\n\n"),
      resources: resume.experience.map((experience) => ({
        type: "experience",
        id: experience.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      })),
      priority: 95,
    },
    {
      id: "resume-projects",
      intent: "projects",
      title: "Projects",
      keywords: ["project", "projects", "favorite project", "proud", "archguard", "sonicbridge", "tapori", "biometric", "orhan", "sally"],
      phrases: ["favorite project", "which project are you most proud of", "your projects"],
      content: resume.projects.map((project) =>
        `${project.name}${project.favorite ? " (favorite project)" : ""}: ${project.summary}${project.url ? ` URL: ${project.url}` : ""}`
      ).join("\n"),
      resources: resume.projects.map((project) => ({ type: "project", id: project.id })),
      priority: 95,
    },
    {
      id: "resume-skills",
      intent: "skills",
      title: "Skills",
      keywords: ["skills", "tech stack", "technologies", "kotlin", "java", "android", "compose", "gradle", "architecture", "tensorflow lite", "tflite", "exercise recognition", "squat detection"],
      phrases: ["what are your skills", "your tech stack", "technologies you use"],
      content: `Skills: ${resume.skills.join(", ")}.`,
      resources: [{ type: "skills", id: "android" }, { type: "skills", id: "architecture" }],
      priority: 90,
    },
    {
      id: "resume-articles",
      intent: "articles",
      title: "Articles",
      keywords: ["article", "articles", "blog", "blogs", "written", "medium", "subtitle", "in-app updates", "pyaar"],
      phrases: ["what articles have you written", "your articles", "what have you written"],
      content: resume.articles.map((article) => `${article.title}: ${article.summary}`).join("\n"),
      resources: resume.articles.map((article) => ({ type: "article", id: article.id })),
      priority: 90,
    },
    {
      id: "resume-career-story",
      intent: "careerStory",
      title: "Career Story",
      keywords: ["coding", "programming", "self-taught", "career journey", "career transition", "android journey", "motivation", "why android"],
      phrases: ["where did you learn coding", "how did you learn coding", "how did you learn programming", "tell me about your career journey", "what motivates you"],
      content: resume.careerStory,
      resources: [{ type: "biography", id: "career-transition" }],
      priority: 95,
    },
    {
      id: "resume-achievements",
      intent: "achievements",
      title: "Achievements",
      keywords: ["achievement", "achievements", "proud", "impact", "accomplishment"],
      phrases: ["what are your achievements", "what are you proud of"],
      content: `Achievements: ${resume.achievements.join("; ")}.`,
      priority: 80,
    },
    {
      id: "resume-mission",
      intent: "mission",
      title: "Mission",
      keywords: ["mission", "motivation", "motivates", "values", "why", "goal", "goals", "future", "dream"],
      phrases: ["what is your mission", "what motivates you", "future goals", "what are your goals"],
      content: `Mission: ${resume.mission}\nGoals: ${resume.goals}`,
      priority: 85,
    },
  ];

  return cachedIndex;
};

export const rebuildResumeIndex = (): ResumeSection[] => {
  cachedIndex = null;
  return buildResumeIndex();
};
