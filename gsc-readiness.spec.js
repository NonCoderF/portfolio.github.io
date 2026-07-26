const { test, expect } = require('@playwright/test');

const url = 'http://127.0.0.1:4173/portfolio.github.io/';
const viewports = [320, 360, 390, 412, 768, 1024, 1440];

for (const width of viewports) {
  test(`indexing readiness at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.setViewportSize({ width, height: width >= 1024 ? 1000 : 900 });
    await page.goto(url, { waitUntil: 'networkidle' });

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://noncoderf.github.io/portfolio.github.io/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /AI-powered portfolio/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/noncoderf\.github\.io\/portfolio\.github\.io\//);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^https:\/\/noncoderf\.github\.io\/portfolio\.github\.io\//);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#digital-nizam')).toContainText('AI-powered conversational portfolio');
    await expect(page.locator('#project-index')).toContainText('ArchGuard');
    await expect(page.locator('#contact')).toContainText('sallyinfo365@gmail.com');

    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    const graph = JSON.parse(structuredData)['@graph'].map(item => item['@type']);
    expect(graph).toEqual(expect.arrayContaining(['Person', 'WebSite', 'FAQPage']));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.locator('.menu-toggle').click();
    await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.menu-toggle').click();

    await page.locator('.assistant-trigger').click();
    await expect(page.locator('.assistant-trigger')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#ask-nizam-input')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('.assistant-trigger')).toHaveAttribute('aria-expanded', 'false');

    expect(errors).toEqual([]);
  });
}
