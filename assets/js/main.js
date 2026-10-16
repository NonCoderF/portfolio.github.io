(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const header = $('.site-header'), backTop = $('.back-top');
  $('#year').textContent = new Date().getFullYear();
  $$('img').forEach(image => { image.decoding = 'async'; });
  const faqGrid = $('#faq .faq-grid');
  if (faqGrid) {
    const specializationCard = [...faqGrid.querySelectorAll('.skill-card')].find(card => card.querySelector('h3')?.textContent.trim() === 'What does Nizamuddin specialize in?');
    if (specializationCard) specializationCard.querySelector('p').textContent = 'He specializes in Android, Kotlin, Jetpack Compose, React Native, TypeScript, Expo, Flutter, Dart, Clean Architecture, Android architecture, Mobile AI, LLM integration, Supabase, SDKs, and developer tooling.';
    if (!faqGrid.querySelector('[data-faq-react-native]')) faqGrid.insertAdjacentHTML('beforeend', '<article class="skill-card" data-faq-react-native><h3>What has he built with React Native?</h3><p>He built AI Vision, an AI-powered React Native OCR and image-analysis application using TypeScript, Expo, camera and gallery workflows, navigation, React Hooks, Supabase-backed AI analysis, dynamic structured responses, animations, bottom sheets, and loading, result, and error states.</p></article>');
  }
  const heroKicker = $('.hero-kicker'); if (heroKicker) heroKicker.innerHTML = 'Senior Mobile Engineer <span class="slash">/</span> Android + React Native + AI';
  const heroDescription = $('.hero-description'); if (heroDescription) heroDescription.textContent = 'Building production mobile experiences across Android and React Native, with AI and real-world impact.';

  // Build the hero perimeter as an SVG stroke so the highlight follows the actual rounded panel.
  const heroPanel = $('.portrait-composition');
  if (heroPanel && !$('.hero-perimeter', heroPanel)) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('hero-perimeter'); svg.setAttribute('viewBox', '0 0 1000 700'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient'); gradient.id = 'heroPerimeterGradient'; gradient.setAttribute('x1', '0'); gradient.setAttribute('y1', '0'); gradient.setAttribute('x2', '1'); gradient.setAttribute('y2', '1');
    [['0','#00F0FF'],['.32','#238BFF'],['.7','#9D4DFF'],['1','#F065FF']].forEach(([offset, color]) => { const stop = document.createElementNS(svgNS, 'stop'); stop.setAttribute('offset', offset); stop.setAttribute('stop-color', color); gradient.appendChild(stop); });
    defs.appendChild(gradient); svg.appendChild(defs);
    [['hero-perimeter-base','1.5',''],['hero-perimeter-glow','3','.22 .78'],['hero-perimeter-travel','2.2','.065 .935']].forEach(([className, width, dash]) => { const rect = document.createElementNS(svgNS, 'rect'); rect.classList.add(className); rect.setAttribute('x', '2'); rect.setAttribute('y', '2'); rect.setAttribute('width', '996'); rect.setAttribute('height', '696'); rect.setAttribute('rx', '32'); rect.setAttribute('pathLength', '1'); rect.setAttribute('stroke-width', width); if (dash) rect.setAttribute('stroke-dasharray', dash); svg.appendChild(rect); });
    heroPanel.prepend(svg);
  }
  const heroDepth = $('.hero-editorial-visual');
  const heroFinePointer = matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroDepth && heroFinePointer) {
    let heroFrame = 0, heroX = 50, heroY = 50;
    heroDepth.addEventListener('pointermove', event => {
      const bounds = heroDepth.getBoundingClientRect();
      heroX = ((event.clientX - bounds.left) / bounds.width) * 100;
      heroY = ((event.clientY - bounds.top) / bounds.height) * 100;
      heroDepth.classList.add('is-pointer-active');
      if (!heroFrame) heroFrame = requestAnimationFrame(() => { heroDepth.style.setProperty('--hero-pointer-x', `${heroX}%`); heroDepth.style.setProperty('--hero-pointer-y', `${heroY}%`); heroFrame = 0; });
    }, { passive: true });
    heroDepth.addEventListener('pointerleave', () => { heroDepth.classList.remove('is-pointer-active'); heroDepth.style.setProperty('--hero-pointer-x', '50%'); heroDepth.style.setProperty('--hero-pointer-y', '50%'); });
  }

  const menu = $('.menu-toggle'), nav = $('.desktop-nav');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); menu.innerHTML = `<i class="bi bi-${open ? 'x' : 'list'}"></i>`; });
  $$('.desktop-nav a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); menu.innerHTML = '<i class="bi bi-list"></i>'; }));

  let lastScrollY = window.scrollY, scrollFrame = 0, scrollRange = 1;
  const updateScrollRange = () => { scrollRange = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  function onScroll() {
    const y = window.scrollY;
    lastScrollY = y;
    header?.classList.toggle('scrolled', y > 20);
    backTop?.classList.toggle('visible', y > 600);
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { document.documentElement.style.setProperty('--scroll-progress', `${Math.min(1, y / scrollRange)}`); document.documentElement.style.setProperty('--scroll-light-x', `${50 + Math.sin(y / 700) * 8}%`); scrollFrame = 0; });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { updateScrollRange(); onScroll(); }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updateScrollRange).observe(document.body);
  updateScrollRange();
  onScroll();

  const sections = $$('main section[id]'), links = $$('.desktop-nav a');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { links.forEach(a => a.classList.toggle('active', a.hash === `#${entry.target.id}`)); } }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => observer.observe(section));

  const counters = $$('[data-counter]');
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; const el = entry.target, end = Number(el.dataset.counter), start = performance.now(); const tick = now => { const progress = Math.min((now - start) / 1100, 1); el.textContent = Math.floor(progress * end) + '+'; if (progress < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); counterObserver.unobserve(el); }), { threshold: .6 });
  counters.forEach(el => counterObserver.observe(el));

  if (window.AOS && !matchMedia('(prefers-reduced-motion: reduce)').matches) { AOS.init({ duration: 520, easing: 'ease-out-cubic', once: true, offset: 80, throttleDelay: 80, debounceDelay: 80 }); const originalAOSRefresh = AOS.refresh.bind(AOS); let aosRefreshFrame = 0; AOS.refresh = () => { cancelAnimationFrame(aosRefreshFrame); aosRefreshFrame = requestAnimationFrame(() => originalAOSRefresh()); }; document.documentElement.classList.add('aos-enabled'); }

  // Boot sequence: keep it short, skippable, and never block navigation.
  const boot = $('#boot-screen');
  setTimeout(() => boot?.classList.add('is-done'), matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 1100);
  boot?.addEventListener('click', () => boot.classList.add('is-done'));

  // Command center / keyboard navigation.
  const palette = $('#command-palette'), input = $('#command-input');
  const openPalette = () => { if (!palette) return; palette.hidden = false; input?.focus(); };
  const closePalette = () => { if (palette) palette.hidden = true; };
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); } if (e.key === 'Escape') closePalette(); if (e.key.toLowerCase() === 'a' && document.activeElement !== input) { /* easter egg handled below */ } });
  palette?.addEventListener('click', e => { if (e.target === palette) closePalette(); });
  const commands = { whoami: '#about', projects: '#work', skills: '#skills', contact: '#contact', github: 'https://github.com/NonCoderF', resume: 'assets/resume/resume.pdf', exercise: '#adaptive-exercise-recognition', sonicbridge: '#sonicbridge', software: '#software-engineering', research: '#ai-research-lab', hire: '#contact', clear: '#hero', help: '#contact' };
  ['exercise','sonicbridge','software','research','hire'].forEach(command => $('.command-list')?.insertAdjacentHTML('beforeend', `<button data-command="${command}"><i class="bi bi-arrow-up-right"></i> ${command}</button>`)); $$('.command-list button').forEach(button => button.addEventListener('click', () => { const command = button.dataset.command, destination = commands[command]; closePalette(); if (!destination || command === 'clear') return window.scrollTo({ top: 0, behavior: 'smooth' }); if (destination.startsWith('http') || destination.endsWith('.pdf')) window.open(destination, '_blank', 'noopener'); else document.querySelector(destination)?.scrollIntoView({ behavior: 'smooth' }); }));
  input?.addEventListener('input', () => { const term = input.value.toLowerCase(); $$('.command-list button').forEach(button => button.hidden = !button.dataset.command.includes(term)); });

  // Lightweight glowing cursor and magnetic/tilt interactions on pointer devices.
  const dot = $('.cursor-dot'), ring = $('.cursor-ring'), finePointer = matchMedia('(pointer:fine)').matches;
  if (finePointer && dot && ring) { let rx = 0, ry = 0, mx = 0, my = 0, cursorFrame = 0; addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.left = `${mx}px`; dot.style.top = `${my}px`; dot.style.opacity = 1; ring.style.opacity = 1; if (!cursorFrame) cursorFrame = requestAnimationFrame(() => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; cursorFrame = 0; }); }); $$('a,button,.project-card,.skill-card').forEach(el => { el.addEventListener('mouseenter', () => ring.classList.add('is-hover')); el.addEventListener('mouseleave', () => ring.classList.remove('is-hover')); }); $$('.project-card').forEach(card => card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); card.style.setProperty('--pointer-x', `${((e.clientX - r.left) / r.width) * 100}%`); card.style.setProperty('--pointer-y', `${((e.clientY - r.top) / r.height) * 100}%`); })); $$('.project-card').forEach(card => card.addEventListener('pointerleave', () => { card.style.removeProperty('--pointer-x'); card.style.removeProperty('--pointer-y'); })); }

  // A tiny Web Audio click tone, opt-in and muted by default.
  let soundOn = false, audio; const soundButton = $('.sound-toggle'); soundButton?.addEventListener('click', () => { soundOn = !soundOn; soundButton.innerHTML = `<i class="bi bi-volume-${soundOn ? 'up' : 'mute'}"></i>`; if (soundOn) audio = new (window.AudioContext || window.webkitAudioContext)(); }); const ping = () => { if (!soundOn || !audio) return; const osc = audio.createOscillator(), gain = audio.createGain(); osc.frequency.value = 660; gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .06); osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + .06); }; $$('button,a').forEach(el => el.addEventListener('click', ping));

  // Keyboard easter egg: "android" gives the command center a short boot pulse.
  let keyBuffer = ''; addEventListener('keydown', e => { if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return; keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-24); if (keyBuffer.endsWith('android')) { document.body.classList.add('system-pulse'); setTimeout(() => document.body.classList.remove('system-pulse'), 1400); } if (keyBuffer.endsWith('jarvis')) { const speech = window.speechSynthesis; if (speech) speech.speak(new SpeechSynthesisUtterance('Welcome Nizamuddin. System online.')); } if (keyBuffer.endsWith('sudo hire nizamuddin')) { document.querySelector('.assistant-msg').textContent = 'PERMISSION GRANTED. Welcome to the team.'; document.querySelector('.assistant-shell')?.classList.add('open'); } if (keyBuffer.endsWith('coffee')) { document.querySelector('.assistant-msg').textContent = '☕ Fuel loaded. Ship something thoughtful.'; document.querySelector('.assistant-shell')?.classList.add('open'); } });

  // Assistant presentation layer. Networking stays isolated in services/nizam-api.js.
  const assistant = $('.assistant-shell'), assistantPanel = $('.assistant-panel'), assistantTrigger = $('.assistant-trigger'), assistantClose = $('.assistant-close'), assistantInput = $('.assistant-form input'), assistantForm = $('.assistant-form'), assistantSend = $('.assistant-form button'), assistantMessages = $('.assistant-messages');
  const assistantScrollArea = (() => {
    if (!assistantPanel) return null;
    $('.assistant-prompts', assistantPanel)?.remove();
    const existing = $('.assistant-scroll-area', assistantPanel);
    if (existing) return existing;
    const area = document.createElement('div');
    area.className = 'assistant-scroll-area';
    [$('.assistant-head', assistantPanel), $('.ai-status-strip', assistantPanel), $('.ai-knowledge', assistantPanel), assistantMessages]
      .filter(Boolean)
      .forEach(node => area.appendChild(node));
    assistantPanel.insertBefore(area, assistantForm);
    return area;
  })();
  let didInitialAssistantScroll = false;
  const scrollDigitalMeToBottom = () => requestAnimationFrame(() => {
    if (assistantScrollArea) assistantScrollArea.scrollTop = assistantScrollArea.scrollHeight;
  });
  const initializeAssistantScroll = (scrollToBottom = false) => {
    if (!assistantScrollArea) return;
    requestAnimationFrame(() => {
      if (!assistant?.classList.contains('open')) return;
      void assistantPanel?.offsetHeight;
      void assistantScrollArea.offsetHeight;
      void assistantScrollArea.scrollHeight;
      if (scrollToBottom && !didInitialAssistantScroll) {
        scrollDigitalMeToBottom();
        didInitialAssistantScroll = true;
      }
    });
  };
  if (assistantScrollArea && 'ResizeObserver' in window) {
    const assistantLayoutObserver = new ResizeObserver(() => initializeAssistantScroll());
    assistantLayoutObserver.observe(assistantScrollArea);
    assistantLayoutObserver.observe(assistantPanel);
  }
  const assistantMemory = (() => {
    const dbName = 'digital-me-db', storeName = 'qa-history', fallbackKey = 'digital-me-qa-history';
    const limit = 25;
    const openDb = () => new Promise(resolve => {
      if (!('indexedDB' in window)) return resolve(null);
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    const fallbackRead = () => {
      try { return JSON.parse(localStorage.getItem(fallbackKey) || '[]'); } catch (error) { return []; }
    };
    const fallbackWrite = items => {
      try { localStorage.setItem(fallbackKey, JSON.stringify(items.slice(-limit))); } catch (error) {}
    };
    const all = async () => {
      const db = await openDb();
      if (!db) return fallbackRead();
      return new Promise(resolve => {
        const tx = db.transaction(storeName, 'readonly');
        const request = tx.objectStore(storeName).getAll();
        request.onsuccess = () => resolve((request.result || []).sort((a, b) => a.createdAt - b.createdAt).slice(-limit));
        request.onerror = () => resolve(fallbackRead());
      });
    };
    const save = async (question, answer) => {
      const item = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, question, answer, createdAt: Date.now() };
      const db = await openDb();
      if (!db) { const items = fallbackRead(); items.push(item); fallbackWrite(items); return item; }
      await new Promise(resolve => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(item);
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
      const items = await all();
      if (items.length > limit) {
        const remove = items.slice(0, items.length - limit);
        const tx = db.transaction(storeName, 'readwrite');
        remove.forEach(entry => tx.objectStore(storeName).delete(entry.id));
      }
      return item;
    };
    const clear = async () => {
      localStorage.removeItem(fallbackKey);
      const db = await openDb();
      if (!db) return;
      await new Promise(resolve => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    };
    return { all, save, clear };
  })();
  const assistantError = 'Sorry, I\'m having trouble responding right now. Please try again.';
  const suggestedQuestions = ['How did users cheat the squat detector?', 'Tell me about SonicBridge.'];
  $$('.assistant-prompts,.prompt-list').forEach(group => [...group.querySelectorAll('button')].forEach((button, index) => {
    if (index < suggestedQuestions.length) button.textContent = suggestedQuestions[index];
    else button.remove();
  }));
  let assistantScrollY = 0;
  let assistantOriginRect = null, pendingAssistantOriginRect = null, closeTransitionHandler = null, closeFallbackTimer = null;
  let assistantHistoryActive = false, assistantKeyboardOpen = false, assistantKeyboardDismissed = false, assistantDismissRequested = false, assistantFocusTimer = null;
  const reducedAssistantMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileAssistant = () => matchMedia('(pointer: coarse)').matches || innerWidth <= 767;
  const restoreAssistantHistory = () => history.pushState({ ...(history.state || {}), digitalMe: true }, '', window.location.href);
  const keyboardIsOpen = () => assistantKeyboardOpen && (window.visualViewport ? visualViewport.height < innerHeight - 80 : matchMedia('(pointer: coarse)').matches);
  assistantInput?.addEventListener('focus', () => { assistantKeyboardOpen = true; assistantKeyboardDismissed = false; });
  assistantInput?.addEventListener('blur', () => {
    if (assistantDismissRequested || !assistant?.classList.contains('open') || !mobileAssistant()) {
      assistantKeyboardOpen = false;
      return;
    }
    // Mobile browsers blur the field when the viewport changes or another part
    // of the panel is tapped. Keep Digital Me in typing mode until it is closed.
    assistantKeyboardOpen = true;
    clearTimeout(assistantFocusTimer);
    assistantFocusTimer = setTimeout(() => {
      if (!assistantDismissRequested && assistant?.classList.contains('open') && assistantInput && !assistantInput.disabled) {
        assistantInput.focus({ preventScroll: true });
      }
    }, 80);
  });
  visualViewport?.addEventListener('resize', () => {
    if (visualViewport.height < innerHeight - 80) {
      assistantKeyboardOpen = true;
      assistantKeyboardDismissed = false;
    } else if (assistant?.classList.contains('open')) {
      // The user used the OS keyboard-dismiss gesture. Do not immediately
      // focus the field again, but keep Digital Me open.
      assistantKeyboardOpen = false;
      assistantKeyboardDismissed = true;
      clearTimeout(assistantFocusTimer);
    }
  }, { passive: true });
  const finishAssistantClose = () => {
    clearTimeout(closeFallbackTimer);
    closeFallbackTimer = null;
    if (closeTransitionHandler && assistantPanel) assistantPanel.removeEventListener('transitionend', closeTransitionHandler);
    closeTransitionHandler = null;
    const removeAssistantHistory = assistantHistoryActive;
    assistantHistoryActive = false;
    assistantDismissRequested = false;
    assistantKeyboardOpen = false;
    assistantKeyboardDismissed = false;
    clearTimeout(assistantFocusTimer);
    assistant?.classList.remove('open', 'is-closing', 'is-originating');
    assistant?.style.removeProperty('--assistant-origin-x');
    assistant?.style.removeProperty('--assistant-origin-y');
    assistant?.style.removeProperty('--assistant-origin-scale-x');
    assistant?.style.removeProperty('--assistant-origin-scale-y');
    assistantOriginRect = null;
    didInitialAssistantScroll = false;
    assistant.setAttribute('aria-hidden', 'true');
    assistantTrigger?.setAttribute('aria-expanded', 'false');
    assistantTrigger?.focus();
    window.scrollTo({ top: assistantScrollY, behavior: 'auto' });
    if (removeAssistantHistory) history.back();
  };
  const setAssistantOpen = (open, originRect = null) => {
    if (!assistant) return;
    if (open) {
      clearTimeout(closeFallbackTimer);
      closeFallbackTimer = null;
      assistantDismissRequested = false;
      assistantKeyboardDismissed = false;
      if (!assistant.classList.contains('open')) {
        assistantScrollY = window.scrollY;
        assistantHistoryActive = true;
        history.pushState({ ...(history.state || {}), digitalMe: true }, '', window.location.href);
      }
      assistant.classList.add('open');
      assistant.classList.remove('is-closing');
      assistantOriginRect = originRect;
      if (assistantOriginRect && assistantPanel && !reducedAssistantMotion()) {
        requestAnimationFrame(() => {
          const panelRect = assistantPanel.getBoundingClientRect();
          const panelCenterX = panelRect.left + panelRect.width / 2;
          const panelCenterY = panelRect.top + panelRect.height / 2;
          const triggerCenterX = assistantOriginRect.left + assistantOriginRect.width / 2;
          const triggerCenterY = assistantOriginRect.top + assistantOriginRect.height / 2;
          assistant.style.setProperty('--assistant-origin-x', `${triggerCenterX - panelCenterX}px`);
          assistant.style.setProperty('--assistant-origin-y', `${triggerCenterY - panelCenterY}px`);
          assistant.style.setProperty('--assistant-origin-scale-x', `${Math.max(.08, assistantOriginRect.width / panelRect.width)}`);
          assistant.style.setProperty('--assistant-origin-scale-y', `${Math.max(.08, assistantOriginRect.height / panelRect.height)}`);
          assistant.classList.add('is-originating');
          void assistantPanel.offsetWidth;
          requestAnimationFrame(() => assistant.classList.remove('is-originating'));
        });
      }
      assistant.setAttribute('aria-hidden', 'false');
      assistantTrigger?.setAttribute('aria-expanded', 'true');
      initializeAssistantScroll();
      if (mobileAssistant()) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (assistant.classList.contains('open') && !assistantDismissRequested) assistantInput?.focus({ preventScroll: true });
        }));
      }
    } else {
      if (!assistant.classList.contains('open')) return;
      if (reducedAssistantMotion() || !assistantOriginRect || !assistantPanel) return finishAssistantClose();
      assistant.classList.remove('is-originating');
      assistant.classList.add('is-closing');
      clearTimeout(closeFallbackTimer);
      closeTransitionHandler = event => {
        if (event.target === assistantPanel && event.propertyName === 'transform') finishAssistantClose();
      };
      assistantPanel.addEventListener('transitionend', closeTransitionHandler);
      // Some mobile browsers skip transitionend when the viewport/keyboard
      // changes during the close animation. Never leave the full-screen shell
      // mounted as an invisible touch interceptor.
      closeFallbackTimer = setTimeout(finishAssistantClose, reducedAssistantMotion() ? 0 : 520);
    }
  };
  const openAssistant = () => { const origin = pendingAssistantOriginRect; pendingAssistantOriginRect = null; setAssistantOpen(true, origin); };
  const postAssistant = (text, className = '') => { openAssistant(); const p = document.createElement('p'); p.className = `assistant-msg ${className}`.trim(); p.textContent = text; assistantMessages?.appendChild(p); scrollDigitalMeToBottom(); return p; };
  const buildHistory = items => items.slice(-3).flatMap(item => [
    { role: 'user', content: String(item.question).slice(0, 1000) },
    { role: 'assistant', content: String(item.answer).slice(0, 1000) }
  ]);
  const getAssistantHistory = async () => {
    const history = await assistantMemory.all();
    return buildHistory(history);
  };
  const renderMemoryHistory = async () => {
    const history = await assistantMemory.all();
    if (!assistantMessages || !history.length || $('.ai-memory-summary', assistantMessages)) return;
    const panel = document.createElement('div');
    panel.className = 'assistant-msg ai-memory-summary';
    panel.innerHTML = `<span class="ai-message-label">LOCAL MEMORY / ${history.length} SAVED</span><div class="ai-memory-actions"><button type="button" class="ai-memory-clear">Clear local Q&A</button></div>${history.slice(-3).map(item => `<details><summary>${escapeAI(item.question)}</summary><p>${highlightTech(item.answer)}</p></details>`).join('')}`;
    assistantMessages.appendChild(panel);
    scrollDigitalMeToBottom();
    $('.ai-memory-clear', panel)?.addEventListener('click', async () => { await assistantMemory.clear(); panel.remove(); postAssistant('Local Digital Me Q&A history cleared for this browser.', 'reveal'); });
  };
  const escapeAI = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const techWords = ['Kotlin','Dart','Flutter','Riverpod','Dio','GoRouter','Jetpack Compose','Compose','Gradle','MVVM','MVI','Android','OpenAI','LLM','Supabase','Clean Architecture','Open Source','Architecture','GraphQL','Firebase','SonicBridge','Biometric SDK','Sally Launcher','Tapori AI','ArchGuard','TensorFlow Lite','TFLite','CameraX','ML Kit Pose Detection','Computer Vision','Pose Detection','Pose landmarks','Android Sensors','FormFit','FindMyRecipe','Record & Repeat','Vantage Fit'];
  const highlightTech = text => { let output = escapeAI(text); techWords.sort((a,b) => b.length - a.length).forEach(word => { output = output.replace(new RegExp(`(?<![\\w>])(${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})(?![\\w<])`, 'gi'), '<span class="ai-tech-tag">$1</span>'); }); return output; };
  const formatAIInline = text => { const escaped = escapeAI(text); return escaped.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|#|\/)[^)\s]+)\)/g, '<a class="ai-inline-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'); };
  const formatAIResponse = text => { const lines = String(text).split(/\r?\n/), html = []; let list = []; const flushList = () => { if (list.length) { html.push(`<ul>${list.map(item => `<li>${formatAIInline(item)}</li>`).join('')}</ul>`); list = []; } }; lines.forEach(line => { const trimmed = line.trim(); if (!trimmed) { flushList(); return; } if (/^[-*•]\s+/.test(trimmed)) { list.push(trimmed.replace(/^[-*•]\s+/, '')); return; } flushList(); if (/^(problem|solution|architecture|lessons?|technologies|challenges?|future|engineering|mission|why i built it)\s*:?$/i.test(trimmed)) html.push(`<div class="ai-section-label">${escapeAI(trimmed.replace(/:$/, ''))}</div>`); else if (/^```/.test(trimmed)) html.push(`<pre class="ai-code-block" data-language="${escapeAI(trimmed.replace(/```/, '') || 'code')}"><code>`); else if (/^https?:\/\//.test(trimmed)) html.push(`<a class="ai-action-link" href="${escapeAI(trimmed)}" target="_blank" rel="noopener noreferrer"><i class="bi bi-arrow-up-right"></i> Open resource</a>`); else html.push(`<p>${formatAIInline(trimmed)}</p>`); }); flushList(); return html.join(''); };
  const resourceHrefs = { 'adaptive-exercise-recognition':'#adaptive-exercise-recognition', archguard:'https://github.com/NonCoderF/ArchGuard', sonicbridge:'#sonicbridge', 'tapori-ai':'https://github.com/NonCoderF/tapori-ai', 'biometric-sdk':'https://github.com/NonCoderF/biometric-sdk', 'sally-launcher':'https://play.google.com/store/apps/details?id=com.code.amiles.sally.free&hl=en_IN', findmyrecipe:'https://github.com/NonCoderF/CookWare', formfit:'#formfit' };
  const resourceTitles = { 'adaptive-exercise-recognition':'Adaptive Exercise Recognition', archguard:'ArchGuard', sonicbridge:'SonicBridge', 'tapori-ai':'Tapori AI', 'biometric-sdk':'Biometric SDK', 'sally-launcher':'Sally Launcher', findmyrecipe:'FindMyRecipe', formfit:'FormFit' };
  const trustedGuideRoutes = { 'adaptive-exercise-recognition':'#adaptive-exercise-recognition', archguard:'#archguard', sonicbridge:'#sonicbridge', 'tapori-ai':'#tapori-ai', taporiai:'#tapori-ai', findmyrecipe:'#project-index', formfit:'#formfit', 'biometric-sdk':'#project-index', 'digital-me':'#digital-nizam' };
  const trustedGuideAliases = [
    { id: 'adaptive-exercise-recognition', title: 'Adaptive Exercise Recognition', words: ['computer vision', 'exercise recognition', 'squat detector', 'pose landmarks'] },
    { id: 'archguard', title: 'ArchGuard', words: ['architecture work', 'architecture rules', 'gradle plugin', 'clean architecture'] },
    { id: 'formfit', title: 'FormFit', words: ['formfit', 'fitness project', 'movement tracking'] },
    { id: 'tapori-ai', title: 'Tapori AI', words: ['tapori', 'flutter architecture', 'ai chat'] },
    { id: 'findmyrecipe', title: 'FindMyRecipe', words: ['findmyrecipe', 'recipe project'] },
    { id: 'digital-me', title: 'Digital Me', words: ['digital me', 'professional profile'] }
  ];
  const sanitizeGuideResource = resource => { if (!resource || (resource.id && !resourceHrefs[resource.id] && !trustedGuideRoutes[resource.id])) return null; return { ...resource, route: trustedGuideRoutes[resource.id] || null, title: resource.title || resourceTitles[resource.id] || resource.id }; };
  const inferResources = (resources, prompt, reply) => {
    if (Array.isArray(resources) && resources.length) return resources.map(sanitizeGuideResource).filter(Boolean);
    const text = `${prompt || ''} ${reply || ''}`.toLowerCase();
    return trustedGuideAliases.filter(resource => resource.words.some(word => text.includes(word))).slice(0, 3).map(sanitizeGuideResource);
  };
  const appendResourceCards = (resources, prompt = '', reply = '') => inferResources(resources, prompt, reply).flatMap(resource => {
    const cards = [];
    const title = resource.title || resource.id;
    const renderCard = (href, label) => href ? `<div class="ai-project-card"><strong>${escapeAI(title)}</strong><span class="ai-project-status">${escapeAI(String(resource.type || 'resource').toUpperCase())}</span>${resource.subtitle ? `<small>${escapeAI(resource.subtitle)}</small>` : ''}<div class="ai-project-actions"><a href="${escapeAI(href)}" ${String(href).startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}><i class="bi bi-arrow-up-right"></i> ${escapeAI(label)}</a></div></div>` : '';
    if (resource.route) cards.push(renderCard(resource.route, 'Open portfolio section'));
    else if (resource.url) cards.push(renderCard(resource.url, 'View Source'));
    if (resource.playStoreUrl) cards.push(renderCard(resource.playStoreUrl, 'View on Google Play'));
    if (!cards.length) cards.push(renderCard(resourceHrefs[resource.id], 'Open resource'));
    return cards;
  }).slice(0, 2).join('');
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const streamResponse = async (text, resources = [], prompt = '') => { openAssistant(); const panel = document.createElement('div'); panel.className = 'assistant-msg ai-response reveal'; panel.innerHTML = '<span class="ai-message-label">NIZAM / RESPONSE</span><div class="ai-stream-text"></div>'; assistantMessages?.appendChild(panel); scrollDigitalMeToBottom(); const stream = $('.ai-stream-text', panel); for (const character of String(text)) { stream.textContent += character; scrollDigitalMeToBottom(); await delay(character === '\n' ? 40 : /[.!?,:;]/.test(character) ? 25 : 5); } stream.innerHTML = formatAIResponse(text); const cards = appendResourceCards(resources, prompt, text); if (cards) panel.insertAdjacentHTML('beforeend', cards); scrollDigitalMeToBottom(); return panel; };
  const thinkingPhases = ['Thinking', 'Thinking deeply', 'Acquiring ideas', 'Connecting relevant experience', 'Preparing the answer'];
  const think = async (node, request) => { let index = 0; node.textContent = thinkingPhases[index]; const timer = setInterval(() => { index = (index + 1) % thinkingPhases.length; node.textContent = thinkingPhases[index]; }, 5000); try { return await request; } finally { clearInterval(timer); } };
  const askAssistant = async question => { const prompt = String(question || '').trim(); if (!prompt || !window.NizamApi || assistantForm?.dataset.busy === 'true') return; assistantForm.dataset.busy = 'true'; if (assistantInput) assistantInput.readOnly = true; postAssistant(prompt, 'user-message'); const thinking = postAssistant('Thinking...', 'assistant-typing reveal'); const started = performance.now(); try { const history = await getAssistantHistory(); const request = window.NizamApi.askNizam(prompt, history); const result = await think(thinking, request); const reply = typeof result === 'string' ? result : result.reply; const resources = typeof result === 'string' ? [] : result.resources; thinking.remove(); await streamResponse(reply, resources, prompt); await assistantMemory.save(prompt, reply); $('.ai-memory-summary', assistantMessages)?.remove(); renderMemoryHistory(); const latency = Math.max(1, Math.round(performance.now() - started)); if ($('#ai-latency')) $('#ai-latency').textContent = `${latency}ms`; if ($('#ai-last-response')) $('#ai-last-response').textContent = 'Now'; } catch (error) { thinking.remove(); if (error.name !== 'AbortError') postAssistant(assistantError, 'reveal'); } finally { assistantForm.dataset.busy = 'false'; if (assistantInput) assistantInput.readOnly = false; } };
  const closeAssistant = () => { assistantDismissRequested = true; setAssistantOpen(false); };
  assistant?.addEventListener('click', event => { if (assistant.classList.contains('open') && !event.target.closest('.assistant-panel') && !event.target.closest('.assistant-trigger')) closeAssistant(); });
  addEventListener('popstate', () => {
    if (!assistant?.classList.contains('open')) return;
    assistantHistoryActive = false;
    assistantDismissRequested = true;
    setAssistantOpen(false);
  });
  assistantTrigger?.addEventListener('click', event => { pendingAssistantOriginRect = event.currentTarget.getBoundingClientRect(); }, true);
  $('.assistant-inline-open')?.addEventListener('click', event => { pendingAssistantOriginRect = event.currentTarget.getBoundingClientRect(); }, true);
  $$('.prompt-list button').forEach(button => button.addEventListener('click', event => { pendingAssistantOriginRect = event.currentTarget.getBoundingClientRect(); }, true));
  assistantTrigger?.addEventListener('click', () => { const open = !assistant.classList.contains('open'); if (open) { openAssistant(); renderMemoryHistory(); } else closeAssistant(); });
  assistantClose?.addEventListener('pointerdown', () => { assistantDismissRequested = true; }, { passive: true });
  assistantClose?.addEventListener('click', closeAssistant);
  addEventListener('keydown', event => { if (event.key === 'Escape' && assistant?.classList.contains('open')) closeAssistant(); });
  const formfitQuestions = ['Why did you build FormFit?', 'How are FormFit and FindMyRecipe connected?', 'What technologies power FormFit?', 'When did you start using React Native?', 'Why did you choose React Native for OCR?', 'Explain your OCR architecture.', 'React Native vs Flutter vs native Android?', 'How do you optimize FlatList rendering?', 'What did you build at Geekworkx?'];
  $$('.assistant-prompts,.prompt-list').forEach(group => formfitQuestions.forEach(question => { if ([...group.querySelectorAll('button')].some(button => button.textContent.trim() === question)) return; const button = document.createElement('button'); button.type = 'button'; button.textContent = question; group.appendChild(button); button.addEventListener('click', () => askAssistant(question)); }));
  $$('.assistant-prompts button,.prompt-list button').forEach(button => button.addEventListener('click', () => askAssistant(button.textContent)));
  $('.assistant-inline-open')?.addEventListener('click', event => { event.preventDefault(); openAssistant(); renderMemoryHistory(); });
  assistantForm?.addEventListener('submit', event => { event.preventDefault(); const prompt = assistantInput?.value.trim(); if (!prompt) return; assistantInput.value = ''; askAssistant(prompt); });
  assistantSend?.addEventListener('pointerdown', event => {
    if (document.activeElement === assistantInput) event.preventDefault();
  });
  assistantTrigger?.addEventListener('pointerdown', () => {
    if (assistant?.classList.contains('open')) assistantDismissRequested = true;
  }, { passive: true });
  assistantTrigger?.addEventListener('click', () => {
    if (assistant?.classList.contains('open')) renderMemoryHistory().then(() => initializeAssistantScroll(true));
  });
  $('.assistant-inline-open')?.addEventListener('click', () => {
    requestAnimationFrame(() => renderMemoryHistory().then(() => initializeAssistantScroll(true)));
  });
  renderMemoryHistory();
  assistantMessages?.addEventListener('toggle', event => {
    if (event.target.matches('details')) scrollDigitalMeToBottom();
  }, true);


  // Device lab.
  const devices = { pixel: ['PIXEL 9 PRO','Sally Launcher'], tablet: ['PIXEL TABLET','Vantage Circle'], fold: ['PIXEL FOLD','TaporiAI'], wear: ['PIXEL WATCH','Vantage Fit'] }; $$('.device-tabs button').forEach(button => button.addEventListener('click', () => { $$('.device-tabs button').forEach(b => b.classList.remove('active')); button.classList.add('active'); const [label,title] = devices[button.dataset.device]; $('#device-label').textContent = label; $('#device-title').textContent = title; $('#device-mock').className = `device-mock ${button.dataset.device}`; }));
  $('.architecture-run')?.addEventListener('click', () => { const nodes = $$('.arch-node'); nodes.forEach(n => n.classList.remove('flowing')); nodes.forEach((node, i) => setTimeout(() => node.classList.add('flowing'), i * 260)); });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
  const moduleLabels = {'#about':'01 / ABOUT','#digital-nizam':'02 / DIGITAL ME','#work':'03 / FEATURED PROJECTS','#adaptive-exercise-recognition':'04 / ADAPTIVE EXERCISE RECOGNITION','#project-index':'05 / CASE NOTES','#flutter-journey':'06 / FLUTTER POSITIONING','#ai-engineering':'07 / AI ENGINEERING','#experience':'08 / EXPERIENCE','#skills':'09 / SKILLS','#writing':'10 / ENGINEERING ARTICLES','#faq':'11 / FAQ','#contact':'12 / CONTACT','#device-lab':'13 / DEVICE LAB','#architecture':'14 / LIVE ARCHITECTURE','#nexus-universe':'NEXUS / ENGINEERING BEYOND SOFTWARE','#sonicbridge':'02 / SONICBRIDGE / PRIVATE AUDIO'}; Object.entries(moduleLabels).forEach(([selector,label]) => { const node = document.querySelector(`${selector} .section-index`); if (node) node.textContent = label; }); $$('.brand-name').forEach(node => { node.innerHTML = 'Nizamuddin<span> / Mobile AI</span>'; }); if ($('.boot-title')) $('.boot-title').textContent = 'DIGITAL ME / MOBILE ENGINEERING COMMAND CENTER';
  // JSON data source: when served statically the UI renders from editable files; opening index.html keeps the curated fallback markup.
  const esc = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const projectArchitectures = {
    'ai-vision-ocr': 'Camera capture -> gallery selection -> Supabase Edge Function -> AI image analysis -> dynamic structured results',
    'adaptive-exercise-recognition': 'Camera -> existing pose landmarks -> validation gates -> TensorFlow Lite classifier -> rep detection',
    taporiai: 'Flutter UI -> Riverpod -> Use Cases -> Repository -> Dio -> Supabase Edge Functions -> OpenAI',
    archguard: 'Gradle plugin -> architecture rules -> feature-first validation -> HTML reports',
    formfit: 'CameraX -> ML Kit Pose Detection -> TensorFlow Lite -> MVVM -> Clean Architecture',
    sonicbridge: 'Android TV -> AudioPlaybackCapture -> WebSockets -> PCM -> AudioTrack',
    findmyrecipe: 'Android app -> ingredient capture -> AI identification -> recipe discovery',
    'biometric-sdk': 'Android SDK -> lifecycle-aware BiometricPrompt -> reusable integration API',
    'digital-me': 'Portfolio UI -> Supabase Edge Function -> OpenAI / LLM -> curated professional context'
  };
  let portfolioProjects = [];
  const projectIdForCard = card => {
    const title = $('h3', card)?.textContent.toLowerCase() || '';
    return Object.keys(projectArchitectures).find(id => id === 'ai-vision-ocr' ? title.includes('ai vision') || title.includes('intelligent ocr') : title.includes(id === 'taporiai' ? 'tapori ai' : id.replaceAll('-', ' '))) || (title.includes('adaptive exercise') ? 'adaptive-exercise-recognition' : null);
  };
  const createProjectExplorer = () => {
    if ($('#project-explorer')) return $('#project-explorer');
    const dialog = document.createElement('dialog');
    dialog.id = 'project-explorer'; dialog.className = 'project-explorer-dialog'; aria(dialog, 'modal', 'true');
    document.body.appendChild(dialog);
    dialog.addEventListener('click', event => { if (event.target === dialog || event.target.closest('.project-explorer-close')) closeProjectExplorer(); });
    dialog.addEventListener('click', event => { if (event.target.closest('a[href^="#"]')) closeProjectExplorer(); });
    return dialog;
  };
  const aria = (node, name, value) => node.setAttribute(`aria-${name}`, value);
  const closeProjectExplorer = () => { const dialog = $('#project-explorer'); if (!dialog) return; if (dialog.open && dialog.close) dialog.close(); else dialog.removeAttribute('open'); if (location.hash.startsWith('#project-')) history.back(); };
  const openProjectExplorer = id => {
    const project = portfolioProjects.find(item => item.id === id); if (!project) return;
    const dialog = createProjectExplorer();
    const links = Array.isArray(project.links) && project.links.length ? project.links : (project.href ? [{ label: `Open ${project.name}`, href: project.href, primary: true }] : []);
    dialog.innerHTML = `<div class="project-explorer-head"><div><span class="project-explorer-kicker">SYSTEM INSPECTOR / ${esc(String(project.status || 'PROJECT'))}</span><h2>${esc(project.name)}</h2></div><button class="project-explorer-close" type="button" aria-label="Close project inspector">×</button></div><div class="project-explorer-body"><div class="project-explorer-summary"><p>${esc(project.description || '')}</p>${project.role ? `<span class="project-explorer-label">Engineering role</span><p>${esc(project.role)}</p>` : ''}${project.challenge ? `<span class="project-explorer-label">Engineering challenge</span><p>${esc(project.challenge)}</p>` : ''}<span class="project-explorer-label">Verified stack</span><div class="project-explorer-stack">${(project.technologies || []).map(item => `<span>${esc(item)}</span>`).join('')}</div></div><aside class="project-explorer-side">${project.image ? `<div class="project-explorer-media"><img src="${esc(project.image)}" alt="${esc(project.imageAlt || project.name)}"></div>` : ''}<div><span class="project-explorer-label">Architecture notes</span><div class="project-explorer-architecture">${esc(projectArchitectures[id] || 'Architecture details are not published for this project.')}</div></div><div class="project-explorer-links">${links.map(link => `<a class="${link.primary ? 'btn-primary' : 'btn-quiet'}" href="${esc(link.href)}" ${String(link.href).startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'}>${esc(link.label)} <i class="bi bi-arrow-up-right"></i></a>`).join('')}</div></aside></div>`;
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    if (!location.hash.startsWith('#project-')) history.pushState({ ...(history.state || {}), projectExplorer: id }, '', `#project-${id}`);
  };
  const decorateProjectCards = () => {
    $$('.projects-grid .project-card,.digital-me-card').forEach(card => {
      const id = projectIdForCard(card); if (!id) return; card.dataset.projectId = id;
      if ($('.project-inspect-button', card)) return;
      const content = $('.project-content', card); if (!content) return;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'project-inspect-button'; button.innerHTML = 'Inspect system <i class="bi bi-arrow-up-right"></i>'; button.addEventListener('click', () => openProjectExplorer(id)); content.appendChild(button);
    });
  };
  const projectGridObserver = new MutationObserver(decorateProjectCards);
  if ($('.projects-grid')) projectGridObserver.observe($('.projects-grid'), { childList: true, subtree: true });
  addEventListener('popstate', () => { if ($('#project-explorer')?.open) { $('#project-explorer').close(); } });
  const constellationProjects = {
    'adaptive-exercise-recognition': { label: 'Adaptive ML', route: '#adaptive-exercise-recognition' },
    formfit: { label: 'FormFit', route: '#formfit' },
    findmyrecipe: { label: 'FindMyRecipe', route: '#project-index' },
    taporiai: { label: 'Tapori AI', route: '#tapori-ai' },
    sonicbridge: { label: 'SonicBridge', route: '#sonicbridge' },
    archguard: { label: 'ArchGuard', route: '#archguard' },
    'biometric-sdk': { label: 'Biometric SDK', route: '#project-index' },
    'digital-me': { label: 'Digital Me', route: '#digital-nizam' },
    'ai-vision-ocr': { label: 'AI Vision OCR', route: '#ai-vision' }
  };
  const constellationTech = [
    ['kotlin','Kotlin',20,12], ['compose','Jetpack Compose',20,27], ['flutter','Flutter',20,42], ['react-native','React Native',20,57], ['supabase','Supabase',20,72], ['computer-vision','Computer Vision',20,87],
    ['formfit','FormFit',78,10], ['findmyrecipe','FindMyRecipe',82,24], ['taporiai','Tapori AI',80,39], ['ai-vision-ocr','AI Vision OCR',78,54], ['sonicbridge','SonicBridge',80,69], ['archguard','ArchGuard',78,84], ['digital-me','Digital Me',62,94]
  ];
  const constellationRelationships = { kotlin: ['adaptive-exercise-recognition','formfit','findmyrecipe','taporiai','archguard','biometric-sdk'], compose: ['formfit','findmyrecipe','taporiai'], flutter: ['taporiai'], 'react-native': ['ai-vision-ocr','taporiai'], supabase: ['findmyrecipe','taporiai','ai-vision-ocr','digital-me'], 'computer-vision': ['adaptive-exercise-recognition','formfit'], formfit: ['kotlin','compose','computer-vision'], findmyrecipe: ['kotlin','compose','supabase'], taporiai: ['kotlin','compose','flutter','react-native','supabase'], 'ai-vision-ocr': ['react-native','supabase'], sonicbridge: ['websockets'], archguard: ['gradle-plugin','kotlin'], 'digital-me': ['supabase','computer-vision'], 'gradle-plugin': ['archguard'], websockets: ['sonicbridge'] };
  const constellationTechExtras = [['gradle-plugin','Gradle Plugin',44,77],['websockets','WebSockets',47,61]];
  const buildConstellation = () => {
    if ($('#technology-constellation') || !$('#work')) return;
    const nodes = [...constellationTech, ...constellationTechExtras];
    const techIds = new Set(['kotlin','compose','flutter','react-native','supabase','computer-vision','gradle-plugin','websockets']);
    const projectNodes = nodes.filter(node => !techIds.has(node[0]));
    const edges = [];
    nodes.filter(node => techIds.has(node[0])).forEach(tech => (constellationRelationships[tech[0]] || []).forEach(projectId => { const target = nodes.find(node => node[0] === projectId); if (target) edges.push(`<line class="constellation-edge" data-tech="${tech[0]}" data-project="${projectId}" x1="${tech[2]}" y1="${tech[3]}" x2="${target[2]}" y2="${target[3]}" vector-effect="non-scaling-stroke"></line>`); }));
    const nodeButtons = nodes.map(([id,label,x,y]) => `<button class="constellation-node" data-node-id="${id}" data-kind="${techIds.has(id) ? 'technology' : 'project'}" style="left:${x}%;top:${y}%" type="button">${esc(label)}</button>`).join('');
    const mobileList = projectNodes.map(([id,label]) => `<button type="button" data-node-id="${id}">${esc(label)} <i class="bi bi-arrow-up-right"></i></button>`).join('');
    $('#work').insertAdjacentHTML('afterend', `<section id="technology-constellation" class="section technology-constellation-section"><div class="container"><div class="section-heading heading-row" data-aos="fade-up"><div><span class="section-index">03A / SYSTEM MAP</span><h2>Technologies in<br><em>relationship.</em></h2></div><p class="heading-note">Select a technology or project to see the verified connections inside the portfolio.</p></div><div class="constellation-shell" data-aos="fade-up"><div class="constellation-stage" aria-label="Interactive technology and project relationship graph"><svg class="constellation-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${edges.join('')}</svg>${nodeButtons}</div><div class="constellation-list" aria-label="Project relationship list">${mobileList}</div><aside class="constellation-legend"><h3>System map</h3><p>Relationships are derived from the published project and skills data. Hover, focus, or tap a node to trace its connected work.</p><div class="constellation-selection" aria-live="polite"><strong>Select a node</strong>Connected technologies and projects will appear here.</div></aside></div></div></section>`);
    const selection = $('.constellation-selection');
    const selectNode = (id, navigate = false) => {
      const isTech = techIds.has(id); const related = constellationRelationships[id] || [];
      $$('.constellation-node').forEach(node => { const nodeId = node.dataset.nodeId; const connected = nodeId === id || related.includes(nodeId) || (isTech ? false : related.includes(nodeId)); node.classList.toggle('is-selected', nodeId === id); node.classList.toggle('is-muted', !connected); });
      $$('.constellation-edge').forEach(edge => edge.classList.toggle('is-connected', edge.dataset.tech === id || edge.dataset.project === id || related.includes(edge.dataset.tech) || related.includes(edge.dataset.project)));
      const title = isTech ? nodes.find(node => node[0] === id)?.[1] : constellationProjects[id]?.label || id;
      const relatedLabels = related.map(item => nodes.find(node => node[0] === item)?.[1] || constellationProjects[item]?.label || item).filter(Boolean);
      if (selection) selection.innerHTML = `<strong>${esc(title || id)}</strong>${isTech ? `Connected projects: ${esc(relatedLabels.join(', ') || 'No published connection yet.')}` : `Connected technologies: ${esc(relatedLabels.join(', ') || 'See the project inspector for published details.')}`}`;
      if (navigate && !isTech && constellationProjects[id]?.route) document.querySelector(constellationProjects[id].route)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    $$('.constellation-node,.constellation-list button').forEach(node => { node.addEventListener('mouseenter', () => selectNode(node.dataset.nodeId)); node.addEventListener('focus', () => selectNode(node.dataset.nodeId)); node.addEventListener('click', () => selectNode(node.dataset.nodeId, true)); });
    if (location.hash === '#technology-constellation') requestAnimationFrame(() => $('#technology-constellation')?.scrollIntoView({ behavior: 'auto', block: 'start' }));
    if (window.AOS) AOS.refresh();
  };
  const loadPortfolioData = async () => { try { const [projects, skills] = await Promise.all([fetch('data/projects.json').then(r => r.json()), fetch('data/skills.json').then(r => r.json())]); const grid = $('.projects-grid'); if (grid) grid.innerHTML = projects.slice(0, 7).map((p,i) => { const links = Array.isArray(p.links) && p.links.length ? p.links : [{ label: `Open ${p.name} module`, href: p.href, primary: i === 0 }]; const icon = p.id === 'adaptive-exercise-recognition' ? 'activity' : p.id === 'archguard' ? 'shield-check' : p.id === 'sonicbridge' ? 'headphones' : p.id === 'biometric-sdk' ? 'fingerprint' : p.id === 'formfit' ? 'activity' : p.id.startsWith('findmyrecipe') ? (p.id.endsWith('play') ? 'google-play' : 'book') : p.id === 'medium-articles' ? 'journal-richtext' : 'stars'; return `<article class="project-card ${i===0?'project-featured flagship-project':''} ${p.id === 'formfit' ? 'formfit-project-card' : ''}" data-aos="fade-up"><div class="project-art art-${esc(p.id)}" role="img" aria-label="${esc(p.imageAlt || `${p.name} project visual`)}">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.imageAlt || `${p.name} project visual`)}" loading="lazy">` : ''}<span class="art-label">${esc(p.type).toUpperCase()}</span><div class="shield-icon"><i class="bi bi-${icon}"></i></div></div><div class="project-content"><div class="project-meta"><span>${esc(p.status)} / ${esc(p.version)}</span><i class="bi bi-arrow-up-right"></i></div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>${p.role ? `<p><strong>My role:</strong> ${esc(p.role)}</p>` : ''}${p.challenge ? `<p><strong>Challenge:</strong> ${esc(p.challenge)}</p>` : ''}<div class="tag-row">${p.technologies.map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="project-actions">${links.map(link => `<a class="${link.primary ? 'btn-primary' : 'btn-quiet'}" href="${esc(link.href)}" ${String(link.href).startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'}>${esc(link.label)} <i class="bi bi-arrow-up-right"></i></a>`).join('')}</div>${p.note ? `<p class="project-note">${esc(p.note)}</p>` : ''}</div></article>`; }).join(''); const skillGrid = $('.skills-grid'); if (skillGrid) skillGrid.innerHTML = Object.entries(skills).map(([name,items]) => `<div class="skill-card" data-aos="fade-up"><i class="bi bi-cpu"></i><h3>${esc(name)}</h3><div class="tag-row">${items.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>`).join(''); if (window.AOS) AOS.refresh(); } catch (error) { document.documentElement.dataset.dataMode = 'fallback'; } }; loadPortfolioData();

  const mountOcrShowcase = async () => { try { const response = await fetch('data/ocr-showcase.html'); if (!response.ok) return; const marker = document.querySelector('#adaptive-exercise-recognition'); if (!marker) return; marker.insertAdjacentHTML('beforebegin', await response.text()); $$('.desktop-nav').forEach(nav => { if (!nav.querySelector('[href="#ai-vision"]')) nav.insertAdjacentHTML('beforeend', '<a href="#ai-vision">AI Vision</a><a href="#react-native">React Native</a>'); }); if (window.AOS) AOS.refresh(); const copy = { capture: ['CURRENT STAGE / CAMERA CAPTURE', 'Start with a useful input.', 'The workflow begins with a captured image, then keeps the user oriented as the request moves through the app.'], gallery: ['CURRENT STAGE / IMAGE STORAGE', 'Keep the visual input available.', 'Gallery and image storage make the visual input available for a deliberate selection step.'], selection: ['CURRENT STAGE / IMAGE SELECTION', 'Choose the image that matters.', 'Selection separates capture from analysis and gives the user control over what is sent onward.'], edge: ['CURRENT STAGE / SUPABASE EDGE FUNCTION', 'Move the expensive work behind a boundary.', 'The mobile client hands the image-analysis request to the Supabase-backed server boundary.'], ai: ['CURRENT STAGE / AI IMAGE ANALYSIS', 'Turn pixels into useful interpretation.', 'The AI layer analyzes the selected image so the app can present more than raw capture.'], response: ['CURRENT STAGE / STRUCTURED RESPONSE', 'Keep the response shape useful.', 'Dynamic DTO handling allows the result surface to stay expressive as structured data evolves.'], ui: ['CURRENT STAGE / DYNAMIC RESULTS UI', 'Make the answer readable.', 'Loading, result, error, animation, and bottom-sheet states turn analysis into a usable mobile experience.'] }; const detail = document.querySelector('[data-ocr-detail]'); document.querySelectorAll('[data-ocr-stage]').forEach(node => node.addEventListener('click', () => { document.querySelectorAll('[data-ocr-stage]').forEach(item => item.classList.toggle('is-active', item === node)); const item = copy[node.dataset.ocrStage] || copy.capture; if (detail) detail.innerHTML = `<span class="module-index">${esc(item[0])}</span><h3>${esc(item[1])}</h3><p>${esc(item[2])}</p>`; })); } catch (error) { document.documentElement.dataset.ocrShowcase = 'fallback'; } }; mountOcrShowcase();

  // Nexus departments are content modules: editors change JSON, not layout code.
  const renderNexus = async () => { try { const [software,research,product,timeline,roadmap] = await Promise.all(['software','research','product','timeline','roadmap'].map(file => fetch(`data/${file}.json`).then(r => r.json()))); const principles = $('#software-principles'); if (principles) principles.innerHTML = `<ul>${software.principles.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`; const softwareCards = $('#software-cards'); if (softwareCards) softwareCards.innerHTML = software.modules.map(item => `<article class="nexus-card"><div class="card-top"><span>${esc(item.type)}</span><b>${esc(item.status)}</b></div><h4>${esc(item.name)}</h4><p>${esc(item.lesson)}</p><span class="card-focus">${esc(item.focus)}</span></article>`).join(''); const researchCards = $('#research-cards'); if (researchCards) researchCards.innerHTML = research.topics.map(item => `<article class="nexus-card"><div class="card-top"><span>RESEARCH NODE</span><b>${esc(item.status)}</b></div><h4>${esc(item.name)}</h4><p>${esc(item.description)}</p></article>`).join(''); const productCards = $('#product-cards'); if (productCards) productCards.innerHTML = product.concepts.map(item => `<article class="product-card"><span>${esc(item.tag).toUpperCase()}</span><h4>${esc(item.name)}</h4><p>${esc(item.description)}</p></article>`).join(''); const timelineNodes = $('#timeline-nodes'); if (timelineNodes) timelineNodes.innerHTML = timeline.map(item => `<article class="timeline-node"><b>${esc(item.year)}</b><h4>${esc(item.label)}</h4><p>${esc(item.description)}</p></article>`).join(''); const roadmapCards = $('#roadmap-cards'); if (roadmapCards) roadmapCards.innerHTML = roadmap.map(item => `<article class="roadmap-card"><span>${esc(item.version)}</span><h4>${esc(item.title)}</h4><p>${esc(item.description)}</p></article>`).join(''); if (window.AOS) AOS.refresh(); } catch (error) { document.documentElement.dataset.nexusData = 'fallback'; } }; renderNexus();
  const renderSonicBridge = async () => { try { const sonic = await fetch('data/sonicbridge.json').then(response => response.json()); const highlights = $('#sonicbridge-highlights'); if (highlights) highlights.innerHTML = sonic.highlights.map((item, index) => `<article class="nexus-card"><h4>${esc(item)}</h4><div class="card-top"><span>${String(index + 1).padStart(2,'0')} / VERIFIED</span></div></article>`).join(''); const architecture = $('#sonicbridge-architecture'); if (architecture) architecture.innerHTML = sonic.architecture.map((item, index) => `${index ? '<span class="sonic-bridge-arrow">→</span>' : ''}<div class="sonic-arch-node"><i class="bi bi-${index === 0 ? 'tv' : index === 1 ? 'wifi' : index === 2 ? 'soundwave' : 'phone'}"></i><span>${esc(item.name)}</span><small>${esc(item.detail)}</small></div>`).join(''); const approach = $('#sonicbridge-approach'); if (approach) approach.innerHTML = sonic.approach.map((item, index) => `<article class="nexus-card"><div class="card-top"><span>${String(index + 1).padStart(2,'0')} / SYSTEM STEP</span><b>INTENTIONAL</b></div><h4>${esc(item.name)}</h4><p>${esc(item.detail)}</p></article>`).join(''); const why = $('#sonicbridge-why-copy'); if (why) why.textContent = sonic.why; const related = document.querySelector('.sonicbridge-related p'); if (related) related.textContent = sonic.related; if (window.AOS) AOS.refresh(); } catch (error) { document.documentElement.dataset.sonicbridgeData = 'fallback'; } }; renderSonicBridge();
  fetch('data/projects.json').then(response => response.json()).then(projects => { portfolioProjects = [...projects, { id: 'digital-me', name: 'Digital Me', status: 'INTEGRATED AI EXPERIENCE', description: 'An AI-powered professional profile backed by the portfolio UI, a Supabase Edge Function, an OpenAI / LLM layer, and curated professional context.', role: 'Designed the conversational portfolio experience and its contextual project navigation surface.', challenge: 'Let recruiters inspect verified engineering experience conversationally without replacing the underlying portfolio content.', technologies: ['Supabase Edge Functions', 'OpenAI / LLM', 'Professional context', 'Computer-vision context'], href: '#digital-nizam', links: [{ label: 'Open Digital Me', href: '#digital-nizam', primary: true }] }]; decorateProjectCards(); buildConstellation(); }).catch(() => {});
})();
