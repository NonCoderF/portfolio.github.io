# Nizamuddin Ali Ahmed — Portfolio

Premium, dark-first portfolio for Nizamuddin Ali Ahmed, Senior Android Engineer. Built as a fast static site with semantic HTML5, Bootstrap 5 utilities, modular CSS, vanilla JavaScript, AOS, Typed.js, Swiper assets, and Bootstrap Icons.

## Features

- Responsive, accessible layout with mobile navigation and keyboard-friendly controls
- Dark mode by default with persistent light mode preference
- CSS-art project visuals with no heavy runtime dependencies
- Animated counters, particles, scroll progress, AOS reveal, and typing role line
- SEO metadata, Open Graph tags, JSON-LD Person schema, robots.txt, sitemap, and PWA manifest
- Existing social links, resume, project names, experience, education, and technical information preserved

## Structure

```text
index.html
assets/css/       main, animation, theme, and responsive styles
assets/js/        main interactions, particles, typing, and theme logic
assets/img/       hero, profile, project, icon, and favicon assets
assets/resume/    resume.pdf
assets/vendor/    Bootstrap, Bootstrap Icons, AOS, Typed.js, Swiper, and original vendor assets
```

## Run locally

Serve the folder with any static server. For example, with Python:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Customization

Update the content in `index.html`, adjust design tokens at the top of `assets/css/main.css`, and replace CSS-art visuals with optimized assets under `assets/img/projects/` when available. The resume remains at `assets/resume/resume.pdf`.

## Deployment

This folder is deployable as-is to GitHub Pages, Netlify, Vercel, or any static host. Set the publish directory to the project root. No build step is required.

## License

Personal portfolio source. Reuse the structure freely; replace personal content and assets before publishing as your own.
