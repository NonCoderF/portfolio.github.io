(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const data = fetch('data/shockwave.json').then(response => response.ok ? response.json() : null).catch(() => null);

  const selected = $('#blueprint-selected'), copy = $('#blueprint-copy');
  const readouts = {
    'Television': 'Media source · 55-inch display · HDMI / optical out',
    'Amplifier': 'Power stage · balanced headroom · drives four passive channels',
    'Front Left': 'Front stage · 30° toe-in · primary dialogue image',
    'Front Right': 'Front stage · 30° toe-in · primary dialogue image',
    'Rear Left': 'Rear surround · 110° coverage · ambient detail',
    'Rear Right': 'Rear surround · 110° coverage · ambient detail',
    'Subwoofer': 'Low frequency · tuned placement · bass distribution anchor'
  };
  $$('.bp-node').forEach(node => { const inspect = () => { $$('.bp-node').forEach(item => item.classList.remove('active')); node.classList.add('active'); const name = node.dataset.blueprint; if (selected) selected.textContent = name.toUpperCase(); if (copy) copy.textContent = readouts[name] || 'Component mapped into the Shockwave room system.'; }; node.addEventListener('mouseenter', inspect); node.addEventListener('focus', inspect); node.addEventListener('click', inspect); });

  const flowNodes = $$('.signal-node'); $('.signal-flow')?.addEventListener('mouseenter', () => flowNodes.forEach((node, index) => setTimeout(() => node.classList.add('flowing'), index * 160)));
  $('.shockwave-sound')?.addEventListener('click', () => { const button = $('.shockwave-sound'); button.innerHTML = '<i class="bi bi-soundwave"></i> Room online'; button.classList.add('shockwave-listening'); });

  const calculate = () => { const width = Math.max(2, Number($('#room-width')?.value) || 4.2), length = Math.max(2, Number($('#room-length')?.value) || 5.6), height = Math.max(2, Number($('#room-height')?.value) || 2.8); const area = width * length, distance = Math.min(length * .6, Math.max(2.2, width * .8)), cable = Math.round((width * 2 + length * 3.2) * 1.1), watt = area > 30 ? '180–260 W' : area > 18 ? '120–180 W' : '80–120 W'; $('#calc-distance').textContent = `${distance.toFixed(2)} m`; $('#calc-cable').textContent = `${cable} m`; $('#calc-amp').textContent = watt; $('#calc-coverage').textContent = `${area.toFixed(1)} m²`; $('#calc-positions').textContent = area > 24 ? '4 + sub' : '2 + sub'; };
  ['room-width','room-length','room-height'].forEach(id => document.getElementById(id)?.addEventListener('input', calculate)); calculate();

  // The section gets its own cinematic enter state without holding up the page.
  const section = $('#shockwave'); if (section) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { section.classList.add('shockwave-entered'); observer.disconnect(); } }), { threshold: .1 }); observer.observe(section); $('.desktop-nav')?.insertAdjacentHTML('beforeend', '<a href="#shockwave-hq">Shockwave</a>'); }
  data.then(payload => { if (!payload) return; const process = $('.process-track'); if (process) process.textContent = payload.process.join('  →  '); });
})();
