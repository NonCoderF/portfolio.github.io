const { test } = require('@playwright/test');
test('measure hero geometry', async ({ page }) => {
  await page.goto('file:///C:/Users/NIZAMUDDIN/IdeaProjects/portfolio.github.io/index.html');
  await page.waitForTimeout(6000);
  for (const width of [1440, 1100, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.waitForTimeout(250);
    const result = await page.evaluate(() => {
      const pick = selector => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return { selector, top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), display: s.display, position: s.position, paddingTop: s.paddingTop, marginTop: s.marginTop, transform: s.transform };
      };
      return [pick('.site-header'), pick('.hero-editorial'), pick('.hero-editorial-grid'), pick('.hero-editorial-copy'), pick('.hero-editorial-visual'), pick('.portrait-composition'), pick('#about')];
    });
    console.log(JSON.stringify({ width, result }));
  }
});
