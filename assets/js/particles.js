(() => {
  const canvas = document.getElementById('particles');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer:coarse)').matches) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  let width = 0, height = 0, dpr = 1, frame = 0, active = true;
  const dots = [];
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = canvas.offsetHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots.length = 0;
    for (let i = 0; i < Math.min(38, Math.max(18, width / 28)); i += 1) {
      dots.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12, r: Math.random() * 1.1 + .2 });
    }
  };
  const draw = () => {
    frame = 0;
    if (!active || document.hidden) return;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0,245,255,.028)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 72) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 72) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    dots.forEach((dot, index) => {
      dot.x += dot.vx; dot.y += dot.vy;
      if (dot.x < 0 || dot.x > width) dot.vx *= -1;
      if (dot.y < 0 || dot.y > height) dot.vy *= -1;
      ctx.fillStyle = index % 5 ? 'rgba(0,245,255,.24)' : 'rgba(0,255,163,.3)';
      ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2); ctx.fill();
      if (index < 10) { ctx.strokeStyle = 'rgba(124,58,237,.065)'; ctx.beginPath(); ctx.moveTo(dot.x, dot.y); ctx.lineTo(dot.x + dot.vx * 80, dot.y + dot.vy * 80); ctx.stroke(); }
    });
    frame = requestAnimationFrame(draw);
  };
  const start = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const visibility = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active) start(); });
  visibility.observe(canvas);
  addEventListener('resize', () => { resize(); start(); }, { passive: true });
  document.addEventListener('visibilitychange', start, { passive: true });
  resize(); start();
})();
