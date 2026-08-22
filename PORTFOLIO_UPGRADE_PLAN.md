# Portfolio Upgrade Plan

## 1. Current portfolio structure

- Static portfolio hosted from the repository root.
- Primary page: `index.html`.
- Styling split across `assets/css/main.css`, `responsive.css`, `ai-console.css`, and themed section files.
- Behavior lives mostly in `assets/js/main.js`, with Digital Me networking isolated in `services/nizam-api.js`.
- Content data exists in `data/profile.json`, `data/projects.json`, `data/skills.json`, `data/experience.json`, and related Nexus/section JSON files.
- Resume currently ships at `assets/resume/resume.pdf`.
- SEO metadata and JSON-LD are inline in `index.html`.

## 2. Sections being retained

- Hero, About, Digital Me, stats band, selected work, project index, experience, skills, writing, FAQ, contact, education, device lab, architecture flow, Shockwave, SonicBridge, Nexus, footer.
- Existing command palette, theme toggle, boot sequence, particles, AOS reveals, service worker, resume asset, GitHub/Medium/email links.
- Digital Me backend contract through `services/nizam-api.js`.

## 3. Sections being modified

- Hero: reposition from Senior Android Engineer to Senior Mobile Engineer with Android, Flutter, Kotlin, Dart, Jetpack Compose, Clean Architecture, AI, and Supabase emphasis.
- About: broaden Android-only wording into mobile engineering, architecture, Flutter, AI/LLM, and developer tooling.
- Digital Me: make it more prominent and frame it as an interactive alternative to a static resume.
- Selected work and project index: make Tapori AI the flagship, strengthen ArchGuard, SonicBridge, and Biometric SDK.
- Experience: update Vantage Circle dates and achievements, keeping metrics limited to known 60% MVP to MVVM and 25+ Compose screens.
- Skills: replace keyword-dump grouping with recruiter-friendly categories.
- FAQ/contact/footer: align with Senior Mobile Engineer positioning and remove LinkedIn.

## 4. New sections

- Flutter Journey: "From Native Android to Flutter" with mapping from Android architecture patterns to Flutter equivalents.
- AI Engineering: "Mobile Engineering Meets AI" showing Tapori AI, Digital Me, Supabase Edge Functions, OpenAI integrations, and production-minded AI integration.
- Tapori AI architecture story: concise engineering flow from Flutter UI through Riverpod, use cases, repository, Dio, Supabase Edge Functions, and OpenAI.

## 5. Digital Me integration

- Keep `services/nizam-api.js` endpoint and response contract unchanged.
- Update assistant labels, welcome copy, prompt chips, tech highlights, and contextual links.
- Preserve current submit behavior, streaming response UI, latency readout, and mobile panel behavior.

## 6. Tapori AI update

- Rename to `Tapori AI - Android & Flutter AI Chat Application`.
- Include Android + Flutter migration story without claiming Flutter is the production Play Store version.
- Add direct source link to `https://github.com/NonCoderF/tapori-ai/tree/master-flutter`.
- Preserve Play Store link: `https://play.google.com/store/apps/details?id=com.sparkstudios.tapori.ai.chatbot&hl=en_IN`.
- Show architecture flow, backend contract preservation, Riverpod, Dio, GoRouter, authentication, credits/HTTP 402, payments, Supabase Edge Functions, OpenAI, and Clean Architecture.

## 7. Flutter positioning

- Present Flutter as hands-on cross-platform expansion after 6+ years of mobile/Android engineering.
- Avoid any claim of 6+ years of Flutter experience.
- Use architecture transferability language: Android ViewModel to Riverpod Notifier, Retrofit/OkHttp to Dio, Navigation Component to GoRouter, repositories and use cases preserved.

## 8. AI positioning

- Position AI as product capability, not prompt experimentation.
- Highlight Tapori AI, Digital Me, Supabase Edge Functions, OpenAI/LLM integration, portfolio/professional context, and AI-assisted mobile experiences.

## 9. SEO changes

- Update title, meta description, Open Graph, Twitter metadata, manifest description, and JSON-LD.
- Use one meaningful H1.
- Remove LinkedIn from JSON-LD `sameAs`.
- Naturally include Senior Mobile Engineer, Senior Android Engineer, Flutter Developer, Kotlin Developer, Jetpack Compose, Clean Architecture, Android architecture, Mobile AI, LLM integration, and Supabase.

## 10. Responsive/accessibility improvements

- Verify 375px, 768px, 1024px, and 1440px layouts with local static server and screenshots where tooling permits.
- Ensure Digital Me remains usable on mobile.
- Add or preserve semantic buttons/links, focus states, readable contrast, reduced-motion behavior, and no horizontal scrolling.
- Check resume download, project links, internal hash targets, and absence of public LinkedIn references.
