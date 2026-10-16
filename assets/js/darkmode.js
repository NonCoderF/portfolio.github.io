(() => {
  // The portfolio intentionally ships with one cinematic dark visual system.
  const root = document.documentElement;
  root.dataset.theme = 'dark';
  try { localStorage.removeItem('portfolio-theme'); } catch (error) {}
})();
