import type { KnowledgeRecord } from "./types.ts";

export const professionalKnowledge: KnowledgeRecord[] = [
  {
    id: "experience-1",
    source: "typescript:experience",
    category: "experience",
    type: "experience",
    title: "Professional Experience",
    content: `# Professional Experience

Purpose: Single source of truth for company experience, responsibilities, contributions, problems solved, and professional growth.`,
    topics: ["professional","experience","purpose","single","source","truth","for","company","responsibilities","contributions","problems","solved","and","growth."],
    keywords: ["professional","experience","purpose","single","source","truth","for","company","responsibilities","contributions","problems","solved","and","growth."],
    verified: true,
    priority: 70,
  },
  {
    id: "experience-2",
    source: "typescript:experience",
    category: "experience",
    type: "experience",
    title: "KBG Software",
    content: `## KBG Software

Known role context: Early Android career.

Responsibilities: Mention only as part of my early professional progression.

Architecture: Not enough public detail available.

Major contributions: Not enough public detail available.

Problems solved: Not enough public detail available.

Technologies: Do not invent.

Lessons and growth: This was part of my transition into professional Android engineering.

Answering rule: If asked for specifics, say I have not shared enough detail publicly to answer accurately.`,
    topics: ["kbg","software","known","role","context","early","android","career.","responsibilities","mention","only","part","professional","progression.","architecture","not","enough","public","detail","available.","major","contributions","problems","solved"],
    keywords: ["kbg","software","known","role","context","early","android","career.","responsibilities","mention","only","part","professional","progression.","architecture","not","enough","public","detail","available.","major","contributions","problems","solved","technologies","invent.","lessons","and","growth","this","was","transition","into","engineering.","answering","rule","asked","for","specifics","say"],
    verified: true,
    priority: 70,
  },
  {
    id: "experience-3",
    source: "typescript:experience",
    category: "experience",
    type: "experience",
    title: "Geekworkx Technologies",
    content: `## Geekworkx Technologies

Known role context: Continued Android engineering growth.

Responsibilities: Mention only as part of my professional progression.

Architecture: Not enough public detail available.

Major contributions: Not enough public detail available.

Problems solved: Not enough public detail available.

Technologies: Do not invent.

Lessons and growth: This role was part of the path that helped me grow toward senior Android engineering work.

Answering rule: If asked for specifics, avoid fabricating product names, clients, metrics, or architecture details.`,
    topics: ["geekworkx","technologies","known","role","context","continued","android","engineering","growth.","responsibilities","mention","only","part","professional","progression.","architecture","not","enough","public","detail","available.","major","contributions","problems"],
    keywords: ["geekworkx","technologies","known","role","context","continued","android","engineering","growth.","responsibilities","mention","only","part","professional","progression.","architecture","not","enough","public","detail","available.","major","contributions","problems","solved","invent.","lessons","and","growth","this","was","the","path","that","helped","grow","toward","senior","work.","answering"],
    verified: true,
    priority: 70,
  },
  {
    id: "experience-4",
    source: "typescript:experience",
    category: "experience",
    type: "experience",
    title: "Vantage Circle",
    content: `## Vantage Circle

---
type: employment
company: Vantage Circle
role: Senior Android Engineer
start_date: 2020-07
end_date: 2026-05-08
status: former
is_current: false
---

Known role context: Former Senior Android Engineer work on enterprise Android applications.

Employment status: Former.

Last working day: 8 May 2026.

Current status: Not employed at Vantage Circle.

Historical summary: I worked at Vantage Circle as a Senior Android Engineer until 8 May 2026.

Responsibilities:
- Modernized Android architecture.
- Migrated 60%+ of a large legacy MVP codebase toward MVVM.
- Converted 25+ screens to Jetpack Compose.
- Helped adopt Material3.
- Modularized major features.
- Improved UI performance using Android Profiler.
- Improved step detection using a Kalman Filter.
- Integrated ML Kit Pose Detection.
- Mentored junior engineers.
- Participated in architecture decisions.

Architecture: MVP to MVVM migration, modularization, Compose adoption, Material3 modernization, maintainability-focused Android architecture.

Problems solved: Legacy complexity, maintainability, scalability, performance, team velocity, architecture consistency, sensor reliability, and modernization.

Technologies: Kotlin, Android SDK, Jetpack Compose, Material3, Android Profiler, Kalman Filter, ML Kit Pose Detection, MVVM, modularization.

Lessons: Enterprise Android engineering is not only about screens. It is about making product needs, architecture, performance, maintainability, and team workflow fit together over time.

Why I left or moved on: Answer respectfully and positively. I wanted new engineering challenges, larger systems, deeper work in developer tools, AI, architecture, SDKs, open source, and platform-level engineering. Never criticize Vantage Circle or any previous employer.`,
    topics: ["vantage","circle","---","type","employment","company","role","senior","android","engineer","start","date","2020-07","end","2026-05-08","status","former","current","false","known","context","work","enterprise","applications."],
    keywords: ["vantage","circle","---","type","employment","company","role","senior","android","engineer","start","date","2020-07","end","2026-05-08","status","former","current","false","known","context","work","enterprise","applications.","former.","last","working","day","may","2026.","not","employed","circle.","historical","summary","worked","until","responsibilities","modernized","architecture."],
    verified: true,
    priority: 70,
  },
  {
    id: "skills-1",
    source: "typescript:skills",
    category: "skills",
    type: "skill",
    title: "Technical Skills",
    content: `# Technical Skills

Purpose: Single source of truth for technical skills. Use relevant skills naturally instead of listing everything.

Android: Kotlin, Java, Android SDK, Jetpack Compose, Material3, custom launchers, foreground services, Audio Playback Capture API, Android Profiler, biometric authentication, fingerprint authentication, face authentication, ML Kit Pose Detection, Play Store release experience.

Architecture: Clean Architecture, MVVM, MVP to MVVM migration, modularization, feature-first architecture, layer validation, system design, reusable SDK design, architecture enforcement, declarative DSL design, architecture automation.

Programming languages: Kotlin and Java.

Backend and integration: API integration, OpenAI API usage, local network communication for real-time audio streaming.

Cloud: No specific cloud platform is intentionally included here. Do not claim AWS, GCP, Azure, Firebase, Supabase, or other cloud experience unless the user explicitly provides it.

DevOps and build tooling: Gradle plugins, build automation, executable architecture rules, developer tooling, HTML reports from build tooling.

Testing: Architecture validation through build-time Gradle rules. Do not claim specific test frameworks unless added later.

Performance: Android Profiler, UI performance optimization, step detection, Kalman Filter usage, practical Android performance debugging.

Developer tools: Gradle plugin development, declarative DSLs, architecture rule automation, reports, SDK design, developer experience.

Engineering practices: Codebase modernization, modular design, architecture reviews, mentoring, automation, open source development, reusable systems.`,
    topics: ["technical","skills","purpose","single","source","truth","for","skills.","use","relevant","naturally","instead","listing","everything.","android","kotlin","java","sdk","jetpack","compose","material3","custom","launchers","foreground"],
    keywords: ["technical","skills","purpose","single","source","truth","for","skills.","use","relevant","naturally","instead","listing","everything.","android","kotlin","java","sdk","jetpack","compose","material3","custom","launchers","foreground","services","audio","playback","capture","api","profiler","biometric","authentication","fingerprint","face","kit","pose","detection","play","store","release"],
    verified: true,
    priority: 70,
  }
];
