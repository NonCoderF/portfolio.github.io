import type { ParsedResume } from "./types.ts";

export const RESUME_JSON: ParsedResume = {
  identity: {
    name: "Nizamuddin Ali Ahmed",
    preferredName: "Nizam",
    profession: "Senior Android Engineer",
    experience: "6+ years of Android engineering experience",
    dateOfBirth: "11 April 1993",
    dayOfBirth: "Sunday",
    birthplace: "Mukalmua, Assam, India",
    hometown: "Mukalmua, Assam, India",
    nationality: "Indian",
  },
  education: {
    degree: "Bachelor of Engineering in Mechanical Engineering",
    institution: "Royal School of Engineering and Technology",
    period: "2013-2017",
    academicProjects: [
      "Four-legged Robot",
      "Virtual Stress Analysis in a Bicycle Frame",
    ],
  },
  experience: [
    {
      company: "Vantage Circle",
      role: "Senior Android Engineer",
      startDate: "2020-07",
      endDate: "2026-05-08",
      status: "former",
      isCurrent: false,
      summary:
        "Former Senior Android Engineer role on enterprise Android applications and architecture modernization. Last working day: 8 May 2026.",
      highlights: [
        "Migrated 60%+ of a large legacy MVP codebase toward MVVM",
        "Converted 25+ screens to Jetpack Compose",
        "Helped adopt Material3",
        "Modularized major features",
        "Improved UI performance using Android Profiler",
        "Improved step detection using a Kalman Filter",
        "Integrated ML Kit Pose Detection",
        "Used TensorFlow Lite for on-device exercise recognition, including squat detection, with posture, lighting, orientation, and liveness validation",
        "Mentored junior engineers",
      ],
    },
    {
      company: "Geekworkx Technologies",
      summary:
        "Continued Android engineering growth before senior-level Android work. Public details are limited.",
    },
    {
      company: "KBG Software",
      summary:
        "Early professional Android career role. Public details are limited.",
    },
  ],
  projects: [
    {
      id: "archguard",
      name: "ArchGuard",
      favorite: true,
      url: "https://github.com/NonCoderF/ArchGuard",
      summary:
        "Favorite project. Kotlin Gradle plugin that turns architecture guidelines into executable build-time checks with feature-first architecture support, layer validation, configurable rules, a declarative DSL, and HTML reports.",
    },
    {
      id: "sonicbridge",
      name: "SonicBridge",
      url: "https://github.com/NonCoderF/Sonic-Bridge",
      summary:
        "Android TV and mobile audio streaming project over local Wi-Fi using Kotlin, Audio Playback Capture API, TCP networking, Jetpack Compose, and foreground services.",
    },
    {
      id: "tapori-ai",
      name: "Tapori AI",
      url: "https://play.google.com/store/apps/details?id=com.sparkstudios.tapori.ai.chatbot",
      summary:
        "Public Android AI chatbot app connecting Android product engineering with OpenAI-powered AI through modular architecture.",
    },
    {
      id: "biometric-sdk",
      name: "Biometric SDK",
      url: "https://github.com/NonCoderF/biometric-sdk",
      summary:
        "Reusable Android SDK for biometric authentication, including fingerprint and face authentication integration.",
    },
    {
      id: "orhan",
      name: "Orhan Project",
      summary:
        "Public portfolio project with limited shared details. Do not invent mission, architecture, technologies, metrics, repository, or demo.",
    },
    {
      id: "sally-launcher",
      name: "Sally Launcher",
      summary:
        "Custom Android launcher exploration with gallery, music player, and video player capabilities.",
    },
    {
      id: "shockwave",
      name: "Shockwave",
      summary:
        "Future-facing idea, not a launched product, around affordable immersive entertainment, home audio, acoustic engineering, AI room planning, and product design.",
    },
  ],
  skills: [
    "Kotlin",
    "Java",
    "Android SDK",
    "Jetpack Compose",
    "Material3",
    "MVVM",
    "MVP to MVVM migration",
    "Clean Architecture",
    "Modularization",
    "Feature-first architecture",
    "Reusable SDK design",
    "Gradle plugin development",
    "Build automation",
    "Developer tooling",
    "Android Profiler",
    "ML Kit Pose Detection",
    "TensorFlow Lite",
    "On-device exercise recognition",
    "Kalman Filter",
    "Audio Playback Capture API",
    "TCP networking",
    "OpenAI API integration",
  ],
  articles: [
    {
      id: "subtitle-algorithm",
      title: "Subtitle Algorithm",
      summary:
        "Article about handling subtitle timing, text handling, and algorithmic problem solving.",
    },
    {
      id: "in-app-updates",
      title: "In-App Updates",
      summary:
        "Article about practical Android app distribution and update flows.",
    },
    {
      id: "plug-and-play-biometric-system",
      title: "Plug-and-Play Biometric System",
      summary:
        "Article about reusable biometric authentication integration and SDK thinking.",
    },
    {
      id: "pyaar-ka-algorithm",
      title: "Pyaar Ka Algorithm",
      summary:
        "Article explaining algorithmic thinking in a creative and relatable style.",
    },
  ],
  careerStory:
    "I studied Mechanical Engineering and did not come from a formal Computer Science background. I taught myself Java, Data Structures, Algorithms, and Kotlin before moving into Android development. Over time, I expanded into Android SDK development, Gradle plugin development, architecture and modularization, AI-powered applications, and developer tools. I worked at Vantage Circle as a Senior Android Engineer until 8 May 2026.",
  achievements: [
    "Migrated 60%+ of a large legacy MVP Android codebase toward MVVM",
    "Converted 25+ screens to Jetpack Compose",
    "Built ArchGuard, a Kotlin Gradle plugin for executable architecture rules",
  ],
  mission:
    "Build useful engineering platforms and tools that combine Android, architecture, AI, automation, developer tooling, and great user experience.",
  goals:
    "Focus on open-source Android and developer tools, ArchGuard, SonicBridge, AI-driven products, improving my digital twin, and exploring new Android engineering opportunities.",
};
