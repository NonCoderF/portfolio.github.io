(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const header = $('.site-header'), backTop = $('.back-top'), progress = $('#progress-bar');
  $('#year').textContent = new Date().getFullYear();

  const menu = $('.menu-toggle'), nav = $('.desktop-nav');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); menu.innerHTML = `<i class="bi bi-${open ? 'x' : 'list'}"></i>`; });
  $$('.desktop-nav a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); menu.innerHTML = '<i class="bi bi-list"></i>'; }));

  function onScroll() { const y = window.scrollY; header?.classList.toggle('scrolled', y > 20); backTop?.classList.toggle('visible', y > 600); const max = document.documentElement.scrollHeight - innerHeight; if (progress) progress.style.width = `${max ? y / max * 100 : 0}%`; }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const sections = $$('main section[id]'), links = $$('.desktop-nav a');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { links.forEach(a => a.classList.toggle('active', a.hash === `#${entry.target.id}`)); } }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => observer.observe(section));

  const counters = $$('[data-counter]');
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; const el = entry.target, end = Number(el.dataset.counter), start = performance.now(); const tick = now => { const progress = Math.min((now - start) / 1100, 1); el.textContent = Math.floor(progress * end) + '+'; if (progress < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); counterObserver.unobserve(el); }), { threshold: .6 });
  counters.forEach(el => counterObserver.observe(el));

  if (window.AOS && !matchMedia('(prefers-reduced-motion: reduce)').matches) AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 80 });

  // Boot sequence: keep it short, skippable, and never block navigation.
  const boot = $('#boot-screen');
  setTimeout(() => boot?.classList.add('is-done'), matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 2400);
  boot?.addEventListener('click', () => boot.classList.add('is-done'));

  // Command center / keyboard navigation.
  const palette = $('#command-palette'), input = $('#command-input');
  const openPalette = () => { if (!palette) return; palette.hidden = false; input?.focus(); };
  const closePalette = () => { if (palette) palette.hidden = true; };
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); } if (e.key === 'Escape') closePalette(); if (e.key.toLowerCase() === 'a' && document.activeElement !== input) { /* easter egg handled below */ } });
  palette?.addEventListener('click', e => { if (e.target === palette) closePalette(); });
  const commands = { whoami: '#about', projects: '#work', skills: '#skills', contact: '#contact', github: 'https://github.com/NonCoderF', resume: 'assets/resume/resume.pdf', clear: '#hero', help: '#contact' };
  $$('.command-list button').forEach(button => button.addEventListener('click', () => { const command = button.dataset.command, destination = commands[command]; closePalette(); if (!destination || command === 'clear') return window.scrollTo({ top: 0, behavior: 'smooth' }); if (destination.startsWith('http') || destination.endsWith('.pdf')) window.open(destination, '_blank', 'noopener'); else document.querySelector(destination)?.scrollIntoView({ behavior: 'smooth' }); }));
  input?.addEventListener('input', () => { const term = input.value.toLowerCase(); $$('.command-list button').forEach(button => button.hidden = !button.dataset.command.includes(term)); });

  // Lightweight cursor and magnetic/tilt interactions on pointer devices.
  const dot = $('.cursor-dot'), ring = $('.cursor-ring'), finePointer = matchMedia('(pointer:fine)').matches;
  if (finePointer && dot && ring) { let rx = 0, ry = 0, mx = 0, my = 0; addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.left = `${mx}px`; dot.style.top = `${my}px`; dot.style.opacity = 1; ring.style.opacity = 1; }); const follow = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; requestAnimationFrame(follow); }; follow(); $$('a,button,.project-card,.skill-card').forEach(el => { el.addEventListener('mouseenter', () => ring.classList.add('is-hover')); el.addEventListener('mouseleave', () => ring.classList.remove('is-hover')); }); $$('.project-card').forEach(card => card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); card.style.transform = `perspective(900px) rotateX(${(e.clientY-r.top-r.height/2)/-35}deg) rotateY(${(e.clientX-r.left-r.width/2)/35}deg) translateY(-5px)`; })); $$('.project-card').forEach(card => card.addEventListener('pointerleave', () => card.style.transform = '')); }

  // A tiny Web Audio click tone, opt-in and muted by default.
  let soundOn = false, audio; const soundButton = $('.sound-toggle'); soundButton?.addEventListener('click', () => { soundOn = !soundOn; soundButton.innerHTML = `<i class="bi bi-volume-${soundOn ? 'up' : 'mute'}"></i>`; if (soundOn) audio = new (window.AudioContext || window.webkitAudioContext)(); }); const ping = () => { if (!soundOn || !audio) return; const osc = audio.createOscillator(), gain = audio.createGain(); osc.frequency.value = 660; gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .06); osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + .06); }; $$('button,a').forEach(el => el.addEventListener('click', ping));

  // Keyboard easter egg: "android" gives the command center a short boot pulse.
  let keyBuffer = ''; addEventListener('keydown', e => { if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return; keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-10); if (keyBuffer.endsWith('android')) { document.body.classList.add('system-pulse'); setTimeout(() => document.body.classList.remove('system-pulse'), 1400); } if (keyBuffer.endsWith('jarvis')) { const speech = window.speechSynthesis; if (speech) speech.speak(new SpeechSynthesisUtterance('Welcome Nizamuddin. System online.')); } });
})();
