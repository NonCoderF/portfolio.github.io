# Nizamuddin Ali Ahmed - Mobile Engineering Portfolio

Live site: [noncoderf.github.io/portfolio.github.io](https://noncoderf.github.io/portfolio.github.io/)

This repository contains Nizamuddin Ali Ahmed's personal developer portfolio: a fast, cinematic static site focused on senior mobile engineering, native Android, React Native, AI-powered applications, architecture, and product engineering.

The portfolio is designed to show both finished products and the engineering thinking behind them. Visitors can explore project case studies, technical architecture flows, a React Native learning journey, a flagship AI-powered OCR application, open-source work, and the interactive Digital Me profile.

## What the portfolio showcases

- 6+ years of Android and mobile engineering experience.
- Native Android work with Kotlin, Java, Jetpack Compose, MVVM, Clean Architecture, performance engineering, computer vision, and TensorFlow Lite.
- React Native and TypeScript work, including the AI Vision OCR application built with Expo, camera and image workflows, Supabase, AI analysis, navigation, hooks, dynamic response handling, animations, and bottom sheets.
- Cross-platform engineering through Flutter and the Tapori AI project.
- AI-enabled products and backend integrations using Supabase Edge Functions and LLM services.
- Open-source developer tooling such as ArchGuard and Biometric SDK.
- Interactive engineering explanations through Digital Me.

## Featured projects

### AI Vision - Intelligent OCR & Image Analysis

The flagship React Native project. It presents the product flow from camera capture and gallery selection through Supabase-backed AI image analysis and a dynamic structured-results interface.

- [OCR source repository](https://github.com/NonCoderF/Ocr)
- [OCR showcase section](https://noncoderf.github.io/portfolio.github.io/#ai-vision)
- [OCR architecture flow](https://noncoderf.github.io/portfolio.github.io/#ocr-architecture)

The portfolio does not include fabricated OCR screenshots. When verified application captures are available, they can be added to the showcase without changing the architecture presentation.

### Tapori AI

An AI chat application with Android and cross-platform engineering context.

- [Repository](https://github.com/NonCoderF/tapori-ai)
- [React Native branch](https://github.com/NonCoderF/tapori-ai/tree/react-native)
- [Flutter branch](https://github.com/NonCoderF/tapori-ai/tree/master-flutter)
- [Google Play](https://play.google.com/store/apps/details?id=com.sparkstudios.tapori.ai.chatbot&hl=en_IN)

### Other work

- [ArchGuard](https://github.com/NonCoderF/ArchGuard)
- [FindMyRecipe source](https://github.com/NonCoderF/CookWare)
- [FormFit source](https://github.com/NonCoderF/fitness)
- [Biometric SDK](https://github.com/NonCoderF/biometric-sdk)
- [SonicBridge case study](https://noncoderf.github.io/portfolio.github.io/#sonicbridge)
- [Engineering articles](https://medium.com/@sallyinfo365)

## Digital Me

Digital Me is the portfolio's conversational professional profile. It uses the existing portfolio frontend and the Supabase Edge Function integration in `services/nizam-api.js` to answer questions about experience, projects, architecture, and technical decisions.

Suggested questions include:

- When did you start using React Native?
- Why did you choose React Native for OCR?
- Explain your OCR architecture.
- React Native vs Flutter vs native Android?
- How do you optimize FlatList rendering?
- What did you build at Geekworkx?

The frontend request and response flow is preserved in the existing implementation. The Supabase backend is not part of this repository's frontend content changes.

## Tech stack

- Semantic HTML5
- CSS, CSS animations, responsive layout, and CSS-generated visual treatments
- Vanilla JavaScript
- Bootstrap 5 utilities and Bootstrap Icons
- AOS for scroll reveals
- Typed.js for text effects
- Swiper and GLightbox assets where used by existing sections
- Supabase Edge Function integration for Digital Me
- JSON content files for editable portfolio data
- PWA manifest, service worker, offline fallback, and static-host metadata

## Repository structure

```text
index.html                    Main portfolio document and fallback markup
assets/css/                   Design system, responsive styles, and section styles
assets/js/                    Interaction logic, Digital Me UI, data rendering, and effects
assets/img/                   Profile, project, hero, icon, and gallery assets
assets/resume/                Downloadable resume
assets/vendor/                Checked-in frontend vendor assets
data/profile.json             Professional positioning and profile summary
data/projects.json            Project cards, links, technologies, and metadata
data/skills.json              Skill categories and technology tags
data/experience.json          Career timeline and experience data
data/ocr-showcase.html        React Native/OCR showcase sections loaded into the page
data/sonicbridge.json         SonicBridge case-study content
services/nizam-api.js         Digital Me frontend API client
supabase/                     Existing Supabase-related project files
sw.js                         Service worker and offline cache
offline.html                  Offline fallback page
404.html                      Static-host not-found page
manifest.json                 PWA metadata
robots.txt                    Crawler directives
sitemap.xml                   Search-engine sitemap
gsc-readiness.spec.js         Available Playwright smoke-test specification
```

## Run locally

This is a static site and does not require a build step. Serve the repository with a local HTTP server so JSON data and the OCR showcase partial load correctly.

Using Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly with `file://` may prevent browser `fetch()` calls from loading the JSON content model and `data/ocr-showcase.html`. The page includes curated fallback markup for the main portfolio sections, but an HTTP server is recommended for the complete experience.

## Editing content

For normal content updates, edit the JSON files in `data/`:

- `profile.json` - name, role, experience, mission, and summary.
- `projects.json` - project descriptions, technologies, links, and status.
- `skills.json` - skill groups and technology tags.
- `experience.json` - career history.
- `articles.json` and `socials.json` - writing and social destinations.

The OCR showcase layout lives in `data/ocr-showcase.html`, its styling is in `assets/css/ocr-showcase.css`, and its interactive architecture behavior is in `assets/js/main.js`.

Do not place API keys, service-role credentials, or private Supabase configuration in this public repository.

## Deployment

The repository can be deployed directly to GitHub Pages, Netlify, Vercel, or another static host. The publish directory is the repository root and no build command is required.

Existing deployment configuration is included for:

- GitHub Pages: `_config.yml`
- Netlify: `netlify.toml`
- Vercel: `vercel.json`
- Static security headers: `_headers`

Do not deploy or push changes without reviewing the diff first.

## Verification

Useful checks before publishing:

```bash
node --check assets/js/main.js
node -e "for (const f of ['data/projects.json','data/profile.json','data/skills.json','manifest.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('JSON OK')"
git diff --check
```

When Playwright is installed and a local server is running, the available smoke-test specification checks metadata, key sections, Digital Me behavior, navigation controls, and horizontal overflow across several viewport sizes:

```bash
npx playwright test gsc-readiness.spec.js
```

## License and reuse

This is a personal portfolio. The structure and implementation patterns may be reused, but replace personal information, project content, photographs, resume files, and service configuration before publishing a derivative site.
