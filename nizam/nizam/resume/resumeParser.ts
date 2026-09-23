import { RESUME_JSON } from "./resumeSource.ts";
import type { ParsedResume } from "./types.ts";

let cachedResume: ParsedResume | null = null;

export const parseResume = (): ParsedResume => {
  if (cachedResume) {
    return cachedResume;
  }

  cachedResume = structuredClone(RESUME_JSON);
  return cachedResume;
};

export const rebuildResumeCache = (): ParsedResume => {
  cachedResume = structuredClone(RESUME_JSON);
  return cachedResume;
};
