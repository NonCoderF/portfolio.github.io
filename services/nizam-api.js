(() => {
  'use strict';

  const ENDPOINT = 'https://jmyqvrvrguhfujgombqe.supabase.co/functions/v1/nizam';
  let activeController = null;

  const isShockwavePrompt = prompt => /\bshock\s*wave\b|\bshockwave\b/i.test(prompt);

  const fallbackShockwaveReply = async () => {
    const fallback = {
      title: 'Project Shockwave',
      subtitle: 'Hybrid Immersive Audio Engineering Platform',
      mission: 'Engineer an affordable cinematic audio platform using off-the-shelf hardware.',
      objective: 'Deliver premium room-filling audio using intelligent engineering instead of expensive branded ecosystems.',
      process: ['Research', 'Room Measurement', 'Acoustic Planning', 'Component Selection', 'Power Calculations', 'Signal Routing', 'Installation', 'Calibration', 'Testing', 'Optimization'],
      modules: [
        { name: 'Television', role: 'Media Source' },
        { name: 'Audio Splitter', role: 'Signal Routing' },
        { name: 'Amplifier', role: 'Power Stage' },
        { name: 'Passive Speakers', role: 'Room Coverage' },
        { name: 'Subwoofer', role: 'Low Frequency' }
      ],
      roadmap: ['Wireless Synchronization', 'Smartphone Control', 'Automatic Room Calibration', 'AI Powered Equalization', 'Multi-room Audio']
    };

    let shockwave = fallback;
    try {
      const response = await fetch('data/shockwave.json', { headers: { Accept: 'application/json' } });
      if (response.ok) shockwave = { ...fallback, ...await response.json() };
    } catch (error) {
      shockwave = fallback;
    }

    const modules = (shockwave.modules || fallback.modules)
      .slice(0, 5)
      .map(item => `- ${item.name}: ${item.role || item.status || 'System module'}`)
      .join('\n');
    const process = (shockwave.process || fallback.process).slice(0, 6).join(', ');
    const roadmap = (shockwave.roadmap || fallback.roadmap).slice(0, 5).join(', ');

    return `${shockwave.title} is my ${shockwave.subtitle}.

Mission:
${shockwave.mission}

Why I built it:
${shockwave.problem || 'Commercial home theater systems are often too expensive because they sell closed ecosystems. Shockwave explores how thoughtful engineering can make immersive audio more accessible.'}

Engineering:
${shockwave.objective || fallback.objective}

Core modules:
${modules}

Process:
${process}

Future:
${roadmap}`;
  };

  window.NizamApi = {
    async askNizam(prompt) {
      const normalizedPrompt = String(prompt || '').trim();
      if (!normalizedPrompt) return '';

      if (isShockwavePrompt(normalizedPrompt)) return fallbackShockwaveReply();

      if (activeController) activeController.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const url = new URL(ENDPOINT);
        url.searchParams.set('prompt', normalizedPrompt);
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Nizam API request failed');
        const payload = await response.json();
        if (typeof payload.reply !== 'string') throw new Error('Nizam API response was invalid');
        if (!payload.reply.trim() && isShockwavePrompt(normalizedPrompt)) return fallbackShockwaveReply();
        return payload.reply;
      } finally {
        if (activeController === controller) activeController = null;
      }
    }
  };
})();
