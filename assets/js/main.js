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
})();
