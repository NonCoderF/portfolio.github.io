(() => {
  'use strict';

  const ENDPOINT = 'https://jmyqvrvrguhfujgombqe.supabase.co/functions/v1/nizam';
  let activeController = null;

  const isShockwavePrompt = prompt => /\bshock\s*wave\b|\bshockwave\b/i.test(prompt);
  const isExercisePrompt = prompt => /\b(exercise recognition|squat|squats|push[- ]?ups?|jumping jacks?|tflite|tensorflow lite|pose|landmarks|cheat|anti[- ]?cheat|personalized model|iterative algorithm|session recording|recorded sessions|android sensors|kiss principle|liveness)\b/i.test(prompt);

  const fallbackExerciseReply = () => `Adaptive Exercise Recognition is my Vantage Fit computer-vision case study.

Problem:
The requirement was to detect exercises such as squats using the mobile camera. I used an existing pose/skeleton detection API to get labeled body landmarks; my work was the recognition system built on top of those landmarks.

How squat detection started:
- Camera frame -> pose landmarks -> joint movement tracking -> waveform/cycle detection -> confidence threshold -> squat count.
- The first squat detector treated motion as a cycle similar to a sine waveform and counted a rep when the observed pattern crossed the approximate 90% confidence threshold.

What changed in production:
- During real-world testing, background session recording showed how people actually interacted with the feature. Normal QA could not predict every way users would try to game the detector.
- Cheat 1: users lying down could move their legs and mimic the cycle, so I added standing-posture validation and skeletal landmark orientation checks. A squat needed both valid movement cycle + valid standing posture.
- Cheat 2: phone orientation exposed that image coordinates are not real-world orientation, so I used Android device-orientation APIs as a precondition. Instead of making the vision algorithm unnecessarily complicated, use device information the operating system already provides.
- Poor lighting created landmark jitter, so lighting validation rejected bad input before pose detection and recognition.
- Cheat 3: showing a prerecorded squat video could fool the camera because it could still see a person, landmarks, and valid motion. Standard Android devices do not provide reliable universal depth sensing that simply solves this, so I avoided exposing sensitive details and used a device-sensor / physical-context handshake as a lightweight liveness check.
- The vision result was no longer trusted by itself. The system required agreement between the camera/pose signal and an independent device physical-state/sensor signal.

Recorded sessions as engineering feedback:
The recordings were not just monitoring. They revealed unexpected user behavior, false assumptions in the algorithm, new cheating strategies, environmental reliability problems, and edge cases normal development testing never produced. Some of the funniest user behavior produced some of the most valuable engineering lessons. Users often believed they were defeating the camera algorithm itself; in reality, each attempt exposed another assumption that could be measured, understood, and hardened.

ML evolution:
The rule-based waveform detector became difficult to generalize, so classification moved to a TensorFlow Lite model for exercises such as squats, push-ups, and jumping jacks. TFLite handled on-device inference. Training and personalization happened in a separate adaptation pipeline, and updated personalized models were used for future inference.

Personalization:
The system did not only learn what a squat looks like. Over time, it learned what your squat looks like. Valid sessions produced movement data that could adapt recognition around a user's range of motion, speed, body proportions, joint trajectories, and exercise style.

Engineering lesson:
Build -> Observe -> Users Break It -> Understand Why -> Improve -> Repeat. When one sensor can be fooled, validate it with an independent signal. The strongest part of the project was not just integrating TensorFlow Lite; it was evolving the system through real failures, anti-cheat design, device context, validation gates, and production ownership.`;

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

      if (isExercisePrompt(normalizedPrompt)) return fallbackExerciseReply();
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
