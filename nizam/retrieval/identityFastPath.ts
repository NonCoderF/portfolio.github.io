import { identityProfile, type IdentityProfile } from "../knowledge/identityProfile.ts";
import { parseResume } from "../resume/resumeParser.ts";
import { calculateAge } from "./age.ts";
import { normalizeCanonicalQuery } from "./queryNormalizer.ts";
import { detectIntent } from "./intentDetector.ts";
import type { ResourceCard } from "../resources/resourceResolver.ts";

export type IdentityFastPathResult = {
  intent: "dob" | "birthday" | "age" | "birthplace" | "hometown" | "education" | "full-name";
  reply: string;
  resources?: ResourceCard[];
};

const exactIntentPatterns: Array<{
  intent: Exclude<IdentityFastPathResult["intent"], "birthplace" | "dob" | "birthday">;
  patterns: RegExp[];
  reply: (now?: Date) => string;
}> = [
  {
    intent: "age",
    patterns: [/^your age$/, /^how old are you$/, /^what is your age$/],
    reply: (now) => {
      const profileDob = new Date(Date.UTC(identityProfile.birthYear, identityProfile.birthMonth - 1, identityProfile.birthDay));
      return `I'm ${calculateAge(profileDob, now)} years old.`;
    },
  },
  {
    intent: "hometown",
    patterns: [/^where are you from$/, /^what is your hometown$/, /^what is your native place$/],
    reply: () => `I'm from ${parseResume().identity.hometown}.`,
  },
  {
    intent: "education",
    patterns: [
      /^what did you study$/,
      /^what is your education$/,
      /^which degree did you study$/,
      /^what is your qualification$/,
      /^what your qualification$/,
      /^what are your qualifications$/,
      /^which college did you attend$/,
      /^what degree do you have$/,
      /^highest qualification$/,
    ],
    reply: () => {
      const resume = parseResume();
      const period = resume.education.period.replace("-", " and ");
      return `I completed a ${resume.education.degree} from the ${resume.education.institution} between ${period}. Although my degree is in Mechanical Engineering, I later taught myself Java, Data Structures, Algorithms, and Kotlin before moving into Android engineering. I have more than six years of Android engineering experience.`;
    },
  },
  {
    intent: "full-name",
    patterns: [/^what is your full name$/, /^your full name$/, /^what is your name$/],
    reply: () => `My full name is ${parseResume().identity.name}.`,
  },
];

export const getIdentityFastPath = (
  userPrompt: string,
  now: Date = new Date(),
  profile: IdentityProfile = identityProfile,
): IdentityFastPathResult | null => {
  const normalized = normalizeCanonicalQuery(userPrompt);
  const detectedIntent = detectIntent(normalized);

  const birthday = getBirthdayFastPath(normalized, profile);
  if (birthday) {
    return birthday;
  }

  if (detectedIntent.identitySubtype === "birthplace") {
    const birthplace = profile.birthplace?.trim();

    if (!birthplace) {
      return {
        intent: "birthplace",
        reply: "I haven't added my verified birthplace to the information available to this assistant, so I don't want to invent it.",
        resources: [],
      };
    }

    return {
      intent: "birthplace",
      reply: `I was born in ${birthplace}.`,
      resources: [
        {
          type: "identity",
          id: "birthplace",
          title: "Birthplace",
          subtitle: birthplace,
        },
      ],
    };
  }

  for (const intent of exactIntentPatterns) {
    if (intent.patterns.some((pattern) => pattern.test(normalized))) {
      return {
        intent: intent.intent,
        reply: intent.reply(now),
      };
    }
  }

  return null;
};

export const getBirthdayFastPath = (
  normalizedQuery: string,
  profile: IdentityProfile = identityProfile,
): IdentityFastPathResult | null => {
  if (!isBirthdayQuery(normalizedQuery)) {
    return null;
  }

  const asksForFullDate =
    /\bdate of birth\b/.test(normalizedQuery) ||
    /\bwhen were you born\b/.test(normalizedQuery) ||
    /\bwhich date were you born\b/.test(normalizedQuery);

  return {
    intent: asksForFullDate ? "dob" : "birthday",
    reply: asksForFullDate
      ? `I was born on ${profile.birthdayDisplay}.`
      : `My birthday is on ${profile.birthDay} April.`,
    resources: [
      {
        type: "identity",
        id: "date-of-birth",
        title: "Date of Birth",
      },
    ],
  };
};

const isBirthdayQuery = (normalizedQuery: string): boolean =>
  /\b(when were you born|what is your birthday|when is your birthday|your birthday|date of birth|what is your date of birth|which date were you born)\b/.test(normalizedQuery);
