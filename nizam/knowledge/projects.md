# Projects

Purpose: Single source of truth for public projects, product thinking, architecture, trade-offs, lessons, repositories, demos, and common questions.

## Adaptive Exercise Recognition

Status: Production Android computer-vision experience from my work on Vantage Fit.

Problem: Recognize exercises such as squats from mobile-camera input while remaining reliable under real user behavior.

Architecture: Camera frames produced pose landmarks. The initial squat detector tracked joint movement as a waveform/cycle and counted a repetition near a 90% confidence threshold. As rule-based recognition became difficult to generalize, classification moved to an on-device TensorFlow Lite model for exercises including squats, push-ups, and jumping jacks.

Technology: Android, ML Kit Pose Detection, TensorFlow Lite, camera processing, device orientation APIs, Android sensors, and validation gates.

Challenges: Users could mimic squat movement while lying down, rotate the phone, exercise in poor lighting, or show a prerecorded squat video. These cases caused false positives even when pose landmarks and movement appeared valid.

Engineering decisions: Smooth noisy pose/joint coordinates before movement analysis; add standing-posture and skeletal-orientation checks; reject unreliable input under poor lighting; use device orientation as a precondition; and combine camera inference with an independent device-sensor or physical-context signal for liveness. Model training and personalization stayed separate from TensorFlow Lite, which was used for on-device inference.

Lessons learned: A vision result should not be trusted alone when it can be gamed. Real session feedback exposed assumptions that normal QA missed, and independent validation signals made the system more reliable.

Common questions:
- Did I use TensorFlow Lite? Yes. I used it for on-device exercise classification, including squat detection.
- What problems did I face? Posture-based cheating, device orientation, poor-lighting landmark jitter, replay-video attacks, and generalizing rule-based movement detection.

## ArchGuard

Status: Public project and favorite project.

Mission: Turn architecture guidelines into executable build rules.

Problem: Architecture rules often live in documents or code review comments. That makes them easy to miss and hard to enforce consistently.

Architecture: Open-source Gradle plugin with feature-first architecture support, layer validation, configurable rules, a declarative DSL, and HTML reports.

Technology: Kotlin, Gradle plugin development, declarative DSL design, build automation, HTML reporting.

Engineering decisions: I chose build-time validation because the best place to catch architecture drift is inside the developer workflow. The plugin should make architecture visible and repeatable instead of depending only on manual review.

Challenges: Balancing rule strictness with developer experience; making the tool useful without turning architecture into ceremony.

Trade-offs: Strict rules protect structure, but too much rigidity slows teams. The goal is practical enforcement, not architectural policing.

Lessons learned: Architecture becomes stronger when it is automated, visible, and close to where developers work.

Interesting story: ArchGuard came from caring about the gap between what teams say their architecture is and what the codebase actually allows over time.

Future roadmap: Improve architecture automation, reporting, configuration, and developer experience.

Repository: https://github.com/NonCoderF/ArchGuard

Demo: Not provided.

Related articles: Not explicitly provided.

Common questions:
- Why ArchGuard? Because I wanted architecture rules to be executable, not only documented.
- Why Gradle? Because Gradle sits directly in the Android build workflow.
- Why is it my favorite? It combines architecture, Gradle internals, automation, DSL design, and developer experience.

## SonicBridge

Status: Public project.

Mission: Stream Android TV audio to a mobile device over local Wi-Fi.

Problem: I wanted a practical way to bridge TV audio to another Android device in real time.

Architecture: Android TV and mobile apps connected through TCP networking, with foreground services supporting continuous streaming.

Technology: Kotlin, Audio Playback Capture API, TCP networking, Jetpack Compose, foreground services.

Engineering decisions: Treat capture, transport, service lifecycle, permissions, latency, and user experience as one system. Real-time audio does not work well if each part is designed in isolation.

Challenges: Latency, Android permissions, foreground service behavior, local network reliability, platform constraints, and continuous streaming.

Trade-offs: Local Wi-Fi keeps the system practical and private, but it requires careful handling of network reliability and latency.

Lessons learned: Audio engineering forces disciplined thinking across platform APIs, networking, lifecycle, and performance.

Interesting story: SonicBridge reflects my interest in building something useful at the boundary of Android platform engineering and audio.

Future roadmap: Improve stability, reduce latency, polish the product experience, and explore deeper audio engineering.

TV repository: https://github.com/NonCoderF/Wifi-Sound-Transmitter-TV-App

Mobile repository: https://github.com/NonCoderF/Sonic-Bridge

Demo: Not provided.

Related articles: Not explicitly provided.

Common questions:
- Why SonicBridge? Because it is a real engineering problem across audio, networking, Android services, and user experience.
- What was hard? Latency, permissions, service lifecycle, and reliability.

## Tapori AI

Status: Public Android app.

Mission: Build an Android AI chatbot.

Problem: I wanted to connect Android product engineering with OpenAI-powered AI.

Architecture: Modular Android approach with clear integration boundaries.

Technology: Android, Kotlin, OpenAI, modular architecture.

Engineering decisions: Keep AI integration behind maintainable boundaries so the app remains understandable as the product grows.

Challenges: AI products still need reliable integration, clear UX, and strong application architecture.

Trade-offs: AI features can move quickly, but the app architecture should not become messy just because the product is experimental.

Lessons learned: AI products are not only prompts. They need product thinking, integration reliability, architecture, and user experience.

Interesting story: Tapori AI connects my Android background with my curiosity about practical AI products.

Future roadmap: Explore better Android AI experiences and practical AI product ideas.

Repository: Not provided.

Play Store: https://play.google.com/store/apps/details?id=com.sparkstudios.tapori.ai.chatbot

Related articles: Not explicitly provided.

Common questions:
- Why Tapori AI? Because I wanted to build an AI product through the lens of Android engineering.
- What did it teach me? AI work still needs strong app architecture.

## Biometric SDK

Status: Public project.

Mission: Make Android biometric authentication reusable and easier to integrate.

Problem: Biometric authentication can become repetitive across apps.

Architecture: Reusable Android SDK.

Technology: Android biometric authentication, fingerprint authentication, face authentication.

Engineering decisions: Hide integration complexity while keeping the API clear for developers.

Challenges: Designing an SDK surface that feels simple without hiding important authentication behavior.

Trade-offs: A reusable SDK should be easy to adopt, but it must still respect security-sensitive flows and platform behavior.

Lessons learned: Good SDKs reduce repeated work and make the correct path easy.

Interesting story: The project connects directly to my interest in plug-and-play developer experience.

Future roadmap: Improve SDK usability and integration experience.

Repository: https://github.com/NonCoderF/biometric-sdk

Demo: Not provided.

Related articles: Plug-and-play biometric authentication article.

Common questions:
- Why build a biometric SDK? To reduce repeated authentication integration work.
- What makes a good SDK? Clear API, reliable behavior, and low integration friction.

## Orhan

Status: Public portfolio project with insufficient details in this knowledge system.

Mission: Not shared publicly here.

Problem: Not shared publicly here.

Architecture: Not shared publicly here.

Technology: Not shared publicly here.

Engineering decisions: Not shared publicly here.

Challenges: Not shared publicly here.

Trade-offs: Not shared publicly here.

Lessons learned: Not shared publicly here.

Future roadmap: Not shared publicly here.

Repository: Not provided.

Demo: Not provided.

Related articles: Not provided.

Common questions: If asked, say I have not shared enough detail about Orhan to explain it accurately.

## Sally Launcher

Status: Public portfolio project.

Mission: Explore deeper Android platform behavior through a custom launcher.

Problem: I wanted to go beyond normal app screens and understand launcher-level Android experiences.

Architecture: Custom Android launcher with gallery, music player, and video player capabilities.

Technology: Android launcher development, gallery, music player, video player.

Engineering decisions: Build at the platform-experience level instead of only inside a single app flow.

Challenges: Launcher behavior, media experiences, user flow, and Android platform behavior.

Trade-offs: Launcher work gives deeper platform control, but it demands careful UX and platform thinking.

Lessons learned: Platform-level Android work teaches how users move through the device, not just through one app.

Interesting story: Sally Launcher reflects my curiosity about Android beyond standard application screens.

Future roadmap: Improve platform-level Android experiences only within the facts available here.

Repository: Not provided.

Demo: Not provided.

Related articles: Not explicitly provided.

## Shockwave

Status: Future vision only. Not launched, not shipped, not built as a completed product.

Mission: Explore affordable immersive entertainment, home audio, acoustic engineering, AI room planning, and product design.

Problem: Future-facing idea around making immersive audio and entertainment more accessible.

Architecture: Not defined publicly here.

Technology: Future-facing interest in audio engineering and AI room planning.

Engineering decisions: Discuss only as vision, not completed work.

Challenges: Not known yet because it is a future vision.

Trade-offs: Not known yet.

Lessons learned: Not applicable as completed project.

Future roadmap: Continue exploring the idea as a product vision.

Repository: Not provided.

Demo: Not provided.

Related articles: Not provided.

Common questions: If asked, clearly say it is a future-facing idea, not a shipped product.
