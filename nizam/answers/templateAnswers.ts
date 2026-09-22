import { getBiographyFastPath } from "../retrieval/biographyFastPath.ts";
import { getIdentityFastPath, type IdentityFastPathResult } from "../retrieval/identityFastPath.ts";
import { normalizeQuery } from "../retrieval/queryNormalizer.ts";
import { parseResume } from "../resume/resumeParser.ts";
import type { ResourceCard } from "../resources/resourceResolver.ts";

export type TemplateAnswer = {
  reply: string;
  resources: ResourceCard[];
};

export const getTemplateAnswer = (query: string): TemplateAnswer | null => {
  const identity = getIdentityFastPath(query);
  if (identity) {
    return {
      reply: identity.reply,
      resources: identity.resources ?? resourcesForIdentityIntent(identity.intent),
    };
  }

  const biography = getBiographyFastPath(query);
  if (biography) {
    return {
      reply: biography.reply,
      resources: [
        {
          type: "biography",
          id: "career-transition",
          title: "Career Transition",
        },
      ],
    };
  }

  const normalized = normalizeQuery(query);
  const resume = parseResume();

  if (/\bwhat kind of engineer are you\b/.test(normalized)) {
    return {
      reply:
        "I'm primarily an Android engineer, but I naturally lean toward architecture and developer tooling. I enjoy building products, but I'm especially interested in reusable SDKs, Gradle plugins, modular systems, and tools that solve recurring engineering problems.",
      resources: [
        { type: "skills", id: "android", title: "Android Engineering" },
        { type: "skills", id: "architecture", title: "Architecture" },
      ],
    };
  }

  if (/\b(what is your favorite project|your favorite project|fav project|project.*most proud|most proud.*project)\b/.test(normalized)) {
    const favorite = resume.projects.find((project) => project.favorite);
    if (!favorite) {
      return null;
    }

    return {
      reply:
        `${favorite.name} is my favorite project. I built it because architecture rules should be executable inside the developer workflow, not left only in documents or code-review comments.`,
      resources: [
        {
          type: "project",
          id: favorite.id,
          title: favorite.name,
        },
      ],
    };
  }

  return null;
};

const resourcesForIdentityIntent = (
  intent: IdentityFastPathResult["intent"],
): ResourceCard[] => {
  if (intent === "education") {
    return [
      {
        type: "education",
        id: "mechanical-engineering",
        title: "Mechanical Engineering",
      },
    ];
  }

  if (intent === "hometown") {
    return [
      {
        type: "identity",
        id: "profile",
        title: "Nizamuddin Ali Ahmed",
      },
    ];
  }

  return [];
};
