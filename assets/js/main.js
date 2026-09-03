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
  const commands = { whoami: '#about', projects: '#work', skills: '#skills', contact: '#contact', github: 'https://github.com/NonCoderF', resume: 'assets/resume/resume.pdf', exercise: '#adaptive-exercise-recognition', shockwave: '#shockwave-hq', sonicbridge: '#sonicbridge', software: '#software-engineering', research: '#ai-research-lab', hire: '#contact', clear: '#hero', help: '#contact' };
  ['exercise','shockwave','sonicbridge','software','research','hire'].forEach(command => $('.command-list')?.insertAdjacentHTML('beforeend', `<button data-command="${command}"><i class="bi bi-arrow-up-right"></i> ${command}</button>`)); $$('.command-list button').forEach(button => button.addEventListener('click', () => { const command = button.dataset.command, destination = commands[command]; closePalette(); if (!destination || command === 'clear') return window.scrollTo({ top: 0, behavior: 'smooth' }); if (destination.startsWith('http') || destination.endsWith('.pdf')) window.open(destination, '_blank', 'noopener'); else document.querySelector(destination)?.scrollIntoView({ behavior: 'smooth' }); }));
  input?.addEventListener('input', () => { const term = input.value.toLowerCase(); $$('.command-list button').forEach(button => button.hidden = !button.dataset.command.includes(term)); });

  // Lightweight cursor and magnetic/tilt interactions on pointer devices.
  const dot = $('.cursor-dot'), ring = $('.cursor-ring'), finePointer = matchMedia('(pointer:fine)').matches;
  if (finePointer && dot && ring) { let rx = 0, ry = 0, mx = 0, my = 0; addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.left = `${mx}px`; dot.style.top = `${my}px`; dot.style.opacity = 1; ring.style.opacity = 1; }); const follow = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; requestAnimationFrame(follow); }; follow(); $$('a,button,.project-card,.skill-card').forEach(el => { el.addEventListener('mouseenter', () => ring.classList.add('is-hover')); el.addEventListener('mouseleave', () => ring.classList.remove('is-hover')); }); $$('.project-card').forEach(card => card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); card.style.transform = `perspective(900px) rotateX(${(e.clientY-r.top-r.height/2)/-35}deg) rotateY(${(e.clientX-r.left-r.width/2)/35}deg) translateY(-5px)`; })); $$('.project-card').forEach(card => card.addEventListener('pointerleave', () => card.style.transform = '')); }

  // A tiny Web Audio click tone, opt-in and muted by default.
  let soundOn = false, audio; const soundButton = $('.sound-toggle'); soundButton?.addEventListener('click', () => { soundOn = !soundOn; soundButton.innerHTML = `<i class="bi bi-volume-${soundOn ? 'up' : 'mute'}"></i>`; if (soundOn) audio = new (window.AudioContext || window.webkitAudioContext)(); }); const ping = () => { if (!soundOn || !audio) return; const osc = audio.createOscillator(), gain = audio.createGain(); osc.frequency.value = 660; gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .06); osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + .06); }; $$('button,a').forEach(el => el.addEventListener('click', ping));

  // Keyboard easter egg: "android" gives the command center a short boot pulse.
  let keyBuffer = ''; addEventListener('keydown', e => { if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return; keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-24); if (keyBuffer.endsWith('android')) { document.body.classList.add('system-pulse'); setTimeout(() => document.body.classList.remove('system-pulse'), 1400); } if (keyBuffer.endsWith('jarvis')) { const speech = window.speechSynthesis; if (speech) speech.speak(new SpeechSynthesisUtterance('Welcome Nizamuddin. System online.')); } if (keyBuffer.endsWith('sudo hire nizamuddin')) { document.querySelector('.assistant-msg').textContent = 'PERMISSION GRANTED. Welcome to the team.'; document.querySelector('.assistant-shell')?.classList.add('open'); } if (keyBuffer.endsWith('coffee')) { document.querySelector('.assistant-msg').textContent = '☕ Fuel loaded. Ship something thoughtful.'; document.querySelector('.assistant-shell')?.classList.add('open'); } });

  // Assistant presentation layer. Networking stays isolated in services/nizam-api.js.
  const assistant = $('.assistant-shell'), assistantTrigger = $('.assistant-trigger'), assistantClose = $('.assistant-close'), assistantInput = $('.assistant-form input'), assistantForm = $('.assistant-form'), assistantSend = $('.assistant-form button'), assistantMessages = $('.assistant-messages');
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
  const suggestedQuestions = ['How did users cheat the squat detector?', 'Why did you record exercise sessions during testing?', 'How did you stop people from playing squat videos?', 'Give me an example of the KISS principle.', 'How did you use Android sensors with computer vision?'];
  $$('.assistant-prompts button').forEach((button, index) => { button.textContent = suggestedQuestions[index] || suggestedQuestions[0]; });
  const openAssistant = () => { assistant?.classList.add('open'); assistantTrigger?.setAttribute('aria-expanded', 'true'); };
  const scrollAssistantBottom = (behavior = 'smooth') => requestAnimationFrame(() => assistantMessages?.scrollTo({ top: assistantMessages.scrollHeight, behavior }));
  const postAssistant = (text, className = '') => { openAssistant(); const p = document.createElement('p'); p.className = `assistant-msg ${className}`.trim(); p.textContent = text; assistantMessages?.appendChild(p); scrollAssistantBottom(); return p; };
  const buildMemoryContext = items => items.slice(-3).map((item, index) => `Previous Q${index + 1}: ${item.question}\nPrevious A${index + 1}: ${String(item.answer).slice(0, 500)}`).join('\n\n');
  const buildPromptWithMemory = async prompt => {
    const history = await assistantMemory.all();
    const context = buildMemoryContext(history);
    if (!context) return prompt;
    return `Use this recent local Digital Me Q&A history only as conversational context. Do not mention it unless it helps answer the visitor.\n\n${context}\n\nCurrent visitor question: ${prompt}`;
  };
  const renderMemoryHistory = async () => {
    const history = await assistantMemory.all();
    if (!assistantMessages || !history.length || $('.ai-memory-summary', assistantMessages)) return;
    const panel = document.createElement('div');
    panel.className = 'assistant-msg ai-memory-summary';
    panel.innerHTML = `<span class="ai-message-label">LOCAL MEMORY / ${history.length} SAVED</span><div class="ai-memory-actions"><button type="button" class="ai-memory-clear">Clear local Q&A</button></div>${history.slice(-3).map(item => `<details><summary>${escapeAI(item.question)}</summary><p>${highlightTech(item.answer)}</p></details>`).join('')}`;
    assistantMessages.appendChild(panel);
    $('.ai-memory-clear', panel)?.addEventListener('click', async () => { await assistantMemory.clear(); panel.remove(); postAssistant('Local Digital Me Q&A history cleared for this browser.', 'reveal'); });
  };
  const escapeAI = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const techWords = ['Kotlin','Dart','Flutter','Riverpod','Dio','GoRouter','Jetpack Compose','Compose','Gradle','MVVM','MVI','Android','OpenAI','LLM','Supabase','Clean Architecture','Open Source','Architecture','GraphQL','Firebase','SonicBridge','Shockwave','Biometric SDK','Sally Launcher','Tapori AI','ArchGuard','TensorFlow Lite','TFLite','Computer Vision','Pose Detection','Pose landmarks','Android Sensors','Vantage Fit'];
  const projectLinks = { 'exercise recognition': ['Adaptive Exercise Recognition','Vantage Fit computer-vision case study with recorded-session feedback, pose landmarks, validation gates, TFLite classification, anti-cheat design, and personalization.','#adaptive-exercise-recognition'], 'squat': ['Adaptive Exercise Recognition','Squat detection evolved from waveform rules into a validation-gated personalized ML system after real users exposed lying-down, orientation, lighting, and replay-video edge cases.','#adaptive-exercise-recognition'], 'cheat': ['Adaptive Exercise Recognition','Real-world cheating attempts became adversarial testing input for posture validation, orientation gates, lighting checks, and sensor-based liveness.','#adaptive-exercise-recognition'], 'android sensors': ['Adaptive Exercise Recognition','Android sensor and physical-context signals were used as independent validation alongside computer vision.','#adaptive-exercise-recognition'], 'tflite': ['Adaptive Exercise Recognition','TFLite handled on-device inference while training and personalization lived in a separate adaptation pipeline.','#adaptive-exercise-recognition'], 'tensorflow lite': ['Adaptive Exercise Recognition','TFLite handled on-device inference while training and personalization lived in a separate adaptation pipeline.','#adaptive-exercise-recognition'], 'archguard': ['ArchGuard','Gradle plugin for executable architecture rules and clean architecture validation.','https://github.com/NonCoderF/ArchGuard'], 'sonicbridge': ['SonicBridge','TV-to-mobile low-latency audio over local Wi-Fi.','#sonicbridge'], 'shockwave': ['Shockwave','Immersive audio engineering platform.','#shockwave-hq'], 'tapori ai': ['Tapori AI','Android and Flutter AI chat app with Supabase Edge Functions and LLM integration.','https://github.com/NonCoderF/tapori-ai/tree/master-flutter'], 'flutter': ['Tapori AI Flutter Source','Flutter implementation on the master-flutter branch.','https://github.com/NonCoderF/tapori-ai/tree/master-flutter'], 'biometric sdk': ['Biometric SDK','Reusable lifecycle-aware biometric authentication SDK for Android.','https://github.com/NonCoderF/biometric-sdk'], 'sally launcher': ['Sally Launcher','Custom Android launcher focused on a clean experience.','https://play.google.com/store/apps/details?id=com.code.amiles.sally.free&hl=en_IN'] };
  const highlightTech = text => { let output = escapeAI(text); techWords.sort((a,b) => b.length - a.length).forEach(word => { output = output.replace(new RegExp(`(?<![\\w>])(${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})(?![\\w<])`, 'gi'), '<span class="ai-tech-tag">$1</span>'); }); return output; };
  const formatAIResponse = text => { const lines = String(text).split(/\r?\n/), html = []; let list = []; const flushList = () => { if (list.length) { html.push(`<ul>${list.map(item => `<li>${highlightTech(item)}</li>`).join('')}</ul>`); list = []; } }; lines.forEach(line => { const trimmed = line.trim(); if (!trimmed) { flushList(); return; } if (/^[-*•]\s+/.test(trimmed)) { list.push(trimmed.replace(/^[-*•]\s+/, '')); return; } flushList(); if (/^(problem|solution|architecture|lessons?|technologies|challenges?|future|engineering|mission|why i built it)\s*:?$/i.test(trimmed)) html.push(`<div class="ai-section-label">${escapeAI(trimmed.replace(/:$/, ''))}</div>`); else if (/^```/.test(trimmed)) html.push(`<pre class="ai-code-block" data-language="${escapeAI(trimmed.replace(/```/, '') || 'code')}"><code>`); else if (/^https?:\/\//.test(trimmed)) html.push(`<a class="ai-action-link" href="${escapeAI(trimmed)}" target="_blank" rel="noopener noreferrer"><i class="bi bi-arrow-up-right"></i> Open resource</a>`); else html.push(`<p>${highlightTech(trimmed)}</p>`); }); flushList(); return html.join(''); };
  const appendProjectContext = text => { const lower = String(text).toLowerCase(), match = Object.keys(projectLinks).find(key => lower.includes(key)); if (!match) return ''; const [name, description, href] = projectLinks[match]; return `<div class="ai-project-card"><strong>${escapeAI(name)}</strong><span class="ai-project-status">PROJECT MODULE</span><small>${escapeAI(description)}</small><div class="ai-project-actions"><a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}><i class="bi bi-arrow-up-right"></i> Open module</a></div></div>`; };
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const streamResponse = async text => { openAssistant(); const panel = document.createElement('div'); panel.className = 'assistant-msg ai-response reveal'; panel.innerHTML = '<span class="ai-message-label">NIZAM / RESPONSE</span><div class="ai-stream-text"></div>'; assistantMessages?.appendChild(panel); scrollAssistantBottom('auto'); const stream = $('.ai-stream-text', panel); for (const character of String(text)) { stream.textContent += character; scrollAssistantBottom('auto'); await delay(character === '\n' ? 110 : /[.!?,:;]/.test(character) ? 55 : 9); } stream.innerHTML = formatAIResponse(text); const project = appendProjectContext(text); if (project) panel.insertAdjacentHTML('beforeend', project); scrollAssistantBottom(); return panel; };
  const thinkingPhases = ['Initializing knowledge...', 'Loading engineering profile...', 'Analyzing question...', 'Searching experience...', 'Generating response...', 'Complete.'];
  const think = async (node, request) => { let complete = false; request.finally(() => { complete = true; }); for (const phase of thinkingPhases) { node.textContent = phase; if (complete) break; await delay(150); } return request; };
  const askAssistant = async question => { const prompt = String(question || '').trim(); if (!prompt || !window.NizamApi || assistantForm?.dataset.busy === 'true') return; assistantForm.dataset.busy = 'true'; if (assistantInput) assistantInput.disabled = true; if (assistantSend) assistantSend.disabled = true; postAssistant(prompt, 'user-message'); const thinking = postAssistant('Initializing knowledge...', 'assistant-typing reveal'); const started = performance.now(); try { const promptWithMemory = await buildPromptWithMemory(prompt); const request = window.NizamApi.askNizam(promptWithMemory); const reply = await think(thinking, request); thinking.remove(); await streamResponse(reply); await assistantMemory.save(prompt, reply); $('.ai-memory-summary', assistantMessages)?.remove(); renderMemoryHistory(); const latency = Math.max(1, Math.round(performance.now() - started)); if ($('#ai-latency')) $('#ai-latency').textContent = `${latency}ms`; if ($('#ai-last-response')) $('#ai-last-response').textContent = 'Now'; } catch (error) { thinking.remove(); if (error.name !== 'AbortError') postAssistant(assistantError, 'reveal'); } finally { assistantForm.dataset.busy = 'false'; if (assistantInput) assistantInput.disabled = false; if (assistantSend) assistantSend.disabled = false; assistantInput?.focus(); } };
  const closeAssistant = () => { assistant?.classList.remove('open'); assistantTrigger?.setAttribute('aria-expanded', 'false'); assistantTrigger?.focus(); };
  assistantTrigger?.addEventListener('click', () => { const open = assistant.classList.toggle('open'); assistantTrigger.setAttribute('aria-expanded', String(open)); if (open) { renderMemoryHistory(); assistantInput?.focus(); } }); assistantClose?.addEventListener('click', closeAssistant); addEventListener('keydown', event => { if (event.key === 'Escape' && assistant?.classList.contains('open')) closeAssistant(); }); $$('.assistant-prompts button,.prompt-list button').forEach(button => button.addEventListener('click', () => askAssistant(button.textContent))); $('.assistant-inline-open')?.addEventListener('click', event => { event.preventDefault(); openAssistant(); renderMemoryHistory(); assistantInput?.focus(); }); assistantForm?.addEventListener('submit', event => { event.preventDefault(); const prompt = assistantInput?.value.trim(); if (!prompt) return; assistantInput.value = ''; askAssistant(prompt); });
  renderMemoryHistory();

  // Device lab.
  const devices = { pixel: ['PIXEL 9 PRO','Sally Launcher'], tablet: ['PIXEL TABLET','Vantage Circle'], fold: ['PIXEL FOLD','TaporiAI'], wear: ['PIXEL WATCH','Vantage Fit'] }; $$('.device-tabs button').forEach(button => button.addEventListener('click', () => { $$('.device-tabs button').forEach(b => b.classList.remove('active')); button.classList.add('active'); const [label,title] = devices[button.dataset.device]; $('#device-label').textContent = label; $('#device-title').textContent = title; $('#device-mock').className = `device-mock ${button.dataset.device}`; }));
  $('.architecture-run')?.addEventListener('click', () => { const nodes = $$('.arch-node'); nodes.forEach(n => n.classList.remove('flowing')); nodes.forEach((node, i) => setTimeout(() => node.classList.add('flowing'), i * 260)); });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
  const moduleLabels = {'#about':'01 / ABOUT','#digital-nizam':'02 / DIGITAL ME','#work':'03 / FEATURED PROJECTS','#adaptive-exercise-recognition':'04 / ADAPTIVE EXERCISE RECOGNITION','#project-index':'05 / CASE NOTES','#flutter-journey':'06 / FLUTTER POSITIONING','#ai-engineering':'07 / AI ENGINEERING','#experience':'08 / EXPERIENCE','#skills':'09 / SKILLS','#writing':'10 / ENGINEERING ARTICLES','#faq':'11 / FAQ','#contact':'12 / CONTACT','#device-lab':'13 / DEVICE LAB','#architecture':'14 / LIVE ARCHITECTURE','#nexus-universe':'NEXUS / ENGINEERING BEYOND SOFTWARE','#sonicbridge':'02 / SONICBRIDGE / PRIVATE AUDIO'}; Object.entries(moduleLabels).forEach(([selector,label]) => { const node = document.querySelector(`${selector} .section-index`); if (node) node.textContent = label; }); $$('.brand-name').forEach(node => { node.innerHTML = 'Nizamuddin<span> / Mobile AI</span>'; }); if ($('.boot-title')) $('.boot-title').textContent = 'DIGITAL ME / MOBILE ENGINEERING COMMAND CENTER';
  // JSON data source: when served statically the UI renders from editable files; opening index.html keeps the curated fallback markup.
  const esc = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const loadPortfolioData = async () => { try { const [projects, skills] = await Promise.all([fetch('data/projects.json').then(r => r.json()), fetch('data/skills.json').then(r => r.json())]); const grid = $('.projects-grid'); if (grid) grid.innerHTML = projects.slice(0, 4).map((p,i) => { const links = Array.isArray(p.links) && p.links.length ? p.links : [{ label: `Open ${p.name} module`, href: p.href, primary: i === 0 }]; const icon = p.id === 'adaptive-exercise-recognition' ? 'activity' : p.id === 'archguard' ? 'shield-check' : p.id === 'sonicbridge' ? 'headphones' : p.id === 'biometric-sdk' ? 'fingerprint' : p.id === 'medium-articles' ? 'journal-richtext' : 'stars'; return `<article class="project-card ${i===0?'project-featured flagship-project':''}" data-aos="fade-up"><div class="project-art art-${esc(p.id)}" role="img" aria-label="${esc(p.name)} project visual"><span class="art-label">${esc(p.type).toUpperCase()}</span><div class="shield-icon"><i class="bi bi-${icon}"></i></div></div><div class="project-content"><div class="project-meta"><span>${esc(p.status)} / ${esc(p.version)}</span><i class="bi bi-arrow-up-right"></i></div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>${p.role ? `<p><strong>My role:</strong> ${esc(p.role)}</p>` : ''}${p.challenge ? `<p><strong>Challenge:</strong> ${esc(p.challenge)}</p>` : ''}<div class="tag-row">${p.technologies.map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="project-actions">${links.map(link => `<a class="${link.primary ? 'btn-primary' : 'btn-quiet'}" href="${esc(link.href)}" ${String(link.href).startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'}>${esc(link.label)} <i class="bi bi-arrow-up-right"></i></a>`).join('')}</div>${p.note ? `<p class="project-note">${esc(p.note)}</p>` : ''}</div></article>`; }).join(''); const skillGrid = $('.skills-grid'); if (skillGrid) skillGrid.innerHTML = Object.entries(skills).map(([name,items]) => `<div class="skill-card" data-aos="fade-up"><i class="bi bi-cpu"></i><h3>${esc(name)}</h3><div class="tag-row">${items.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>`).join(''); if (window.AOS) AOS.refresh(); } catch (error) { document.documentElement.dataset.dataMode = 'fallback'; } }; loadPortfolioData();

  // Nexus departments are content modules: editors change JSON, not layout code.
  const renderNexus = async () => { try { const [software,research,product,timeline,roadmap] = await Promise.all(['software','research','product','timeline','roadmap'].map(file => fetch(`data/${file}.json`).then(r => r.json()))); const principles = $('#software-principles'); if (principles) principles.innerHTML = `<ul>${software.principles.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`; const softwareCards = $('#software-cards'); if (softwareCards) softwareCards.innerHTML = software.modules.map(item => `<article class="nexus-card"><div class="card-top"><span>${esc(item.type)}</span><b>${esc(item.status)}</b></div><h4>${esc(item.name)}</h4><p>${esc(item.lesson)}</p><span class="card-focus">${esc(item.focus)}</span></article>`).join(''); const researchCards = $('#research-cards'); if (researchCards) researchCards.innerHTML = research.topics.map(item => `<article class="nexus-card"><div class="card-top"><span>RESEARCH NODE</span><b>${esc(item.status)}</b></div><h4>${esc(item.name)}</h4><p>${esc(item.description)}</p></article>`).join(''); const productCards = $('#product-cards'); if (productCards) productCards.innerHTML = product.concepts.map(item => `<article class="product-card"><span>${esc(item.tag).toUpperCase()}</span><h4>${esc(item.name)}</h4><p>${esc(item.description)}</p></article>`).join(''); const timelineNodes = $('#timeline-nodes'); if (timelineNodes) timelineNodes.innerHTML = timeline.map(item => `<article class="timeline-node"><b>${esc(item.year)}</b><h4>${esc(item.label)}</h4><p>${esc(item.description)}</p></article>`).join(''); const roadmapCards = $('#roadmap-cards'); if (roadmapCards) roadmapCards.innerHTML = roadmap.map(item => `<article class="roadmap-card"><span>${esc(item.version)}</span><h4>${esc(item.title)}</h4><p>${esc(item.description)}</p></article>`).join(''); if (window.AOS) AOS.refresh(); } catch (error) { document.documentElement.dataset.nexusData = 'fallback'; } }; renderNexus();
  const renderSonicBridge = async () => { try { const sonic = await fetch('data/sonicbridge.json').then(response => response.json()); const highlights = $('#sonicbridge-highlights'); if (highlights) highlights.innerHTML = sonic.highlights.map((item, index) => `<article class="nexus-card"><h4>${esc(item)}</h4><div class="card-top"><span>${String(index + 1).padStart(2,'0')} / VERIFIED</span></div></article>`).join(''); const architecture = $('#sonicbridge-architecture'); if (architecture) architecture.innerHTML = sonic.architecture.map((item, index) => `${index ? '<span class="sonic-bridge-arrow">→</span>' : ''}<div class="sonic-arch-node"><i class="bi bi-${index === 0 ? 'tv' : index === 1 ? 'wifi' : index === 2 ? 'soundwave' : 'phone'}"></i><span>${esc(item.name)}</span><small>${esc(item.detail)}</small></div>`).join(''); const approach = $('#sonicbridge-approach'); if (approach) approach.innerHTML = sonic.approach.map((item, index) => `<article class="nexus-card"><div class="card-top"><span>${String(index + 1).padStart(2,'0')} / SYSTEM STEP</span><b>INTENTIONAL</b></div><h4>${esc(item.name)}</h4><p>${esc(item.detail)}</p></article>`).join(''); const why = $('#sonicbridge-why-copy'); if (why) why.textContent = sonic.why; const related = document.querySelector('.sonicbridge-related p'); if (related) related.textContent = sonic.related; if (window.AOS) AOS.refresh(); } catch (error) { document.documentElement.dataset.sonicbridgeData = 'fallback'; } }; renderSonicBridge();
})();
