# Nizamuddin Ali Ahmed — Portfolio

Android Engineering Command Center: a dark OLED digital operating system for Nizamuddin Ali Ahmed, Senior Android Engineer. Built as a fast static site with semantic HTML5, Bootstrap 5 utilities, modular CSS, vanilla JavaScript, AOS, Typed.js, Swiper assets, and Bootstrap Icons.

## Features

- Responsive, accessible layout with mobile navigation and keyboard-friendly controls
- Dark mode by default with persistent light mode preference
- CSS-art project visuals with no heavy runtime dependencies
- Animated counters, particles, scroll progress, AOS reveal, and typing role line
- SEO metadata, Open Graph tags, JSON-LD Person schema, robots.txt, sitemap, and PWA manifest
- Existing social links, resume, project names, experience, education, and technical information preserved
- Engineer mode with boot sequence, OS dock, command palette, bounded engineering copilot, device lab, architecture flow, recruiter mode, easter eggs, and optional UI sound
- Content model in `data/profile.json`, `data/projects.json`, `data/experience.json`, `data/skills.json`, `data/articles.json`, and `data/socials.json`
- PWA service worker, offline fallback, 404 page, GitHub Pages config, Netlify config, Vercel config, and security headers
- Project Shockwave flagship case study: hybrid immersive audio system, room blueprint, signal-flow architecture, hardware modules, acoustic comparison, engineering dashboard, cost model, calculator, challenges, and roadmap

## Structure

```text
index.html
assets/css/       main, animation, theme, and responsive styles
assets/js/        main interactions, particles, typing, and theme logic
assets/img/       hero, profile, project, icon, and favicon assets
assets/resume/    resume.pdf
assets/vendor/    Bootstrap, Bootstrap Icons, AOS, Typed.js, Swiper, and original vendor assets
data/             JSON-only portfolio content model
sw.js             Offline cache and PWA service worker
offline.html      Network fallback
404.html          Static-host not-found route
```

## Run locally

Serve the folder with any static server. For example, with Python:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Customization

Update the JSON files in `data/` to change profile, projects, experience, skills, articles, and social destinations. The UI renders these datasets when served from a static server and keeps curated fallback markup when opened directly as `index.html`. Adjust design tokens at the top of `assets/css/main.css` or `assets/css/futuristic.css`. The resume remains at `assets/resume/resume.pdf`.

## Deployment

This folder is deployable as-is to GitHub Pages, Netlify, Vercel, or any static host. Set the publish directory to the project root. No build step is required.

## License

Personal portfolio source. Reuse the structure freely; replace personal content and assets before publishing as your own.
