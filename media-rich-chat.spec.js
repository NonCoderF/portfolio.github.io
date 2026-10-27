const { test, expect } = require('@playwright/test');

const url = 'http://127.0.0.1:4173/portfolio.github.io/';
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#082433"/></svg>';

async function stubApi(page, payload) {
  await page.route('**/functions/v1/nizam', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload)
  }));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('.assistant-trigger').click();
  await page.locator('#ask-nizam-input').fill('Tell me about this');
  await page.locator('.assistant-form').evaluate(form => form.requestSubmit());
}

test('keeps text-only responses backward compatible', async ({ page }) => {
  await stubApi(page, { reply: 'A text-only answer still renders normally.', resources: [] });
  await expect(page.locator('.ai-response')).toContainText('A text-only answer still renders normally.');
  await expect(page.locator('.ai-media-card')).toHaveCount(0);
});

test('renders deduplicated images and expands them accessibly', async ({ page }) => {
  await page.route('https://cdn.example.com/poster.svg', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg }));
  await stubApi(page, {
    reply: 'Here is the poster.',
    media: [
      { type: 'movie-poster', url: 'https://cdn.example.com/poster.svg', title: 'A film', source: 'Film DB', sourceUrl: 'https://example.com/source' },
      { type: 'movie-poster', url: 'https://cdn.example.com/poster.svg', title: 'Duplicate' },
      { url: 'javascript:alert(1)', title: 'Unsafe' }
    ],
    resources: [{ id: 'formfit', type: 'project' }, { id: 'formfit', type: 'project' }]
  });
  const media = page.locator('.ai-media-card');
  await expect(media).toHaveCount(1);
  await expect(media.locator('img')).toHaveAttribute('alt', 'A film');
  await expect(media.locator('.ai-media-source')).toContainText('Film DB');
  await media.locator('.ai-media-expand').click();
  await expect(page.locator('#ai-media-preview')).toBeVisible();
  await expect(page.locator('.ai-media-preview-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#ai-media-preview')).not.toBeVisible();
  await expect(page.locator('.ai-response .ai-project-card')).toHaveCount(1);
});

test('shows a broken-image fallback when media cannot load', async ({ page }) => {
  await page.route('https://cdn.example.com/missing.jpg', route => route.fulfill({ status: 404, body: 'missing' }));
  await stubApi(page, { reply: 'The requested image is unavailable.', media: [{ url: 'https://cdn.example.com/missing.jpg' }] });
  const frame = page.locator('.ai-media-frame');
  await expect(frame).toHaveClass(/ai-media-broken/);
  await expect(frame).toContainText('IMAGE UNAVAILABLE');
  await expect(frame.locator('img')).toHaveCount(0);
});

test('keeps media responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.route('https://cdn.example.com/mobile.svg', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg }));
  await stubApi(page, { reply: 'Mobile media response.', media: [{ url: 'https://cdn.example.com/mobile.svg', width: 400, height: 300 }] });
  const panel = page.locator('.assistant-panel');
  const media = page.locator('.ai-media-card');
  await expect(media).toBeVisible();
  const sizes = await media.evaluate(node => ({ width: node.getBoundingClientRect().width, panel: node.closest('.assistant-panel').getBoundingClientRect().width }));
  expect(sizes.width).toBeLessThanOrEqual(sizes.panel - 20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
