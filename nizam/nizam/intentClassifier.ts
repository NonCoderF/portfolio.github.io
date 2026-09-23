export type MemorySection =
  | "identity"
  | "biography"
  | "career"
  | "experience"
  | "projects"
  | "articles"
  | "skills"
  | "philosophy"
  | "personality"
  | "interview"
  | "faq"
  | "privacy";

export type MemoryIntent = {
  sections: MemorySection[];
};

type IntentRule = {
  sections: MemorySection[];
  patterns: RegExp[];
};

const unique = <T>(items: T[]): T[] => [...new Set(items)];

const hasAny = (message: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(message));

// Rule-based retrieval is intentionally isolated behind classifyIntent so it can
// be replaced later by embeddings or vector search without changing index.ts.
const RULES: IntentRule[] = [
  {
    sections: ["identity"],
    patterns: [
      /\b(full\s*)?name\b/,
      /\bpreferred name\b/,
      /\bwho are you\b/,
      /\bwhere are you from\b/,
      /\bhometown\b/,
      /\bhome town\b/,
      /\bnative place\b/,
      /\bnationality\b/,
      /\bcountry\b/,
      /\bstate\b/,
      /\beducation\b/,
      /\bwhat did you study\b/,
      /\bdegree\b/,
      /\bdob\b/,
      /\bbirth(day| date|place)?\b/,
      /\bwhen were you born\b/,
      /\bage\b/,
      /\bhow old\b/,
      /\bgithub\b/,
      /\blinkedin\b/,
      /\bmedium\b/,
      /\bwebsite\b/,
      /\bportfolio\b/,
    ],
  },
  {
    sections: ["identity", "biography", "career", "personality"],
    patterns: [
      /\btell me about yourself\b/,
      /\bintroduce yourself\b/,
      /\babout you\b/,
      /\byour story\b/,
    ],
  },
  {
    sections: ["biography", "career", "philosophy"],
    patterns: [
      /\bwhy android\b/,
      /\bwhy kotlin\b/,
      /\bwhy architecture\b/,
      /\bwhy software\b/,
      /\bwhy programming\b/,
      /\bwhy did you switch\b/,
      /\bchange careers?\b/,
      /\bmechanical engineering\b/,
      /\bwhy gradle\b/,
      /\bwhy developer tools?\b/,
      /\bwhy sdk\b/,
      /\bwhy ai\b/,
      /\bwhy open source\b/,
    ],
  },
  {
    sections: ["career", "experience"],
    patterns: [
      /\bcareer\b/,
      /\bjourney\b/,
      /\bwork history\b/,
      /\bprofessional background\b/,
      /\bexperience\b/,
      /\bcompany\b/,
      /\bcompanies\b/,
      /\bkbg\b/,
      /\bgeekworkx\b/,
      /\bvantage circle\b/,
      /\bprevious company\b/,
      /\bwhy did you leave\b/,
    ],
  },
  {
    sections: ["projects", "career", "skills", "philosophy"],
    patterns: [
      /\bproject\b/,
      /\bprojects\b/,
      /\bportfolio\b/,
      /\bapps?\b/,
      /\bopen source\b/,
      /\barchguard\b/,
      /\bsonicbridge\b/,
      /\bsonic bridge\b/,
      /\btapori\b/,
      /\bbiometric\b/,
      /\borhan\b/,
      /\bsally\b/,
      /\blauncher\b/,
      /\bshockwave\b/,
      /\bwhat was hard\b/,
      /\bchallenge(s|d)?\b/,
      /\btrade-?offs?\b/,
      /\bhow did you build\b/,
      /\bwhy did you build\b/,
      /\bwhat did you learn\b/,
      /\blessons?\b/,
      /\bfuture roadmap\b/,
      /\brepositor(y|ies)\b/,
      /\bdemo\b/,
    ],
  },
  {
    sections: ["skills", "experience"],
    patterns: [
      /\bskills?\b/,
      /\btech stack\b/,
      /\btechnolog(y|ies)\b/,
      /\btools?\b/,
      /\bcompose\b/,
      /\bjetpack\b/,
      /\bmaterial3\b/,
      /\bmvvm\b/,
      /\bmvp\b/,
      /\bgradle\b/,
      /\bsdk\b/,
      /\bperformance\b/,
      /\bprofiler\b/,
      /\bml kit\b/,
      /\bkalman\b/,
    ],
  },
  {
    sections: ["articles"],
    patterns: [
      /\barticles?\b/,
      /\bblogs?\b/,
      /\bmedium\b/,
      /\bwriting\b/,
      /\bsubtitle\b/,
      /\bin-app updates?\b/,
      /\bpyaar ka algorithm\b/,
    ],
  },
  {
    sections: ["interview", "personality", "experience"],
    patterns: [
      /\bstrengths?\b/,
      /\bweakness(es)?\b/,
      /\bbiggest failure\b/,
      /\bproud\b/,
      /\bmost proud\b/,
      /\bfailure\b/,
      /\bmotivates?\b/,
      /\bcurrently learning\b/,
      /\bwhat are you learning\b/,
      /\bwhere do you see yourself\b/,
      /\bfive years\b/,
      /\bkind of engineer\b/,
      /\bcompany are you looking\b/,
      /\bnext role\b/,
    ],
  },
  {
    sections: ["faq", "personality"],
    patterns: [
      /\bhow are you\b/,
      /\bwhat are you building\b/,
      /\bcoffee\b/,
      /\btea\b/,
      /\bfavorite movie\b/,
      /\bfavourite movie\b/,
      /\bfavorite book\b/,
      /\bfavourite book\b/,
      /\bfavorite programming language\b/,
      /\bfavourite programming language\b/,
      /\bfavorite android api\b/,
      /\bfavourite android api\b/,
      /\badvice\b/,
      /\bbeginners?\b/,
      /\bbiggest lesson\b/,
      /\bdream project\b/,
    ],
  },
  {
    sections: ["philosophy", "personality"],
    patterns: [
      /\bphilosophy\b/,
      /\bvalues?\b/,
      /\bhow do you think\b/,
      /\bengineering mindset\b/,
      /\bprinciples?\b/,
      /\btrade-?offs?\b/,
      /\bdeveloper experience\b/,
      /\bautomation\b/,
      /\breadable systems\b/,
      /\barchitecture should\b/,
    ],
  },
  {
    sections: ["privacy"],
    patterns: [
      /\bfamily\b/,
      /\breligion\b/,
      /\bpolitics\b/,
      /\bsalary\b/,
      /\bincome\b/,
      /\baddress\b/,
      /\bphone\b/,
      /\bemail\b/,
      /\bprivate\b/,
      /\bsecret\b/,
      /\bvisa\b/,
      /\brelationship\b/,
      /\bmedical\b/,
      /\blanguages?\b/,
      /\bcurrent city\b/,
      /\bwhere do you live\b/,
      /\bcurrent location\b/,
    ],
  },
];

export const classifyIntent = (userMessage: string): MemoryIntent => {
  const normalized = userMessage.toLowerCase();
  const sections = RULES.flatMap((rule) =>
    hasAny(normalized, rule.patterns) ? rule.sections : []
  );

  if (sections.length === 0) {
    return {
      sections: ["identity", "personality", "privacy"],
    };
  }

  return {
    sections: unique(sections),
  };
};
