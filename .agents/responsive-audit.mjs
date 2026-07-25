import { chromium } from 'playwright';
import path from 'node:path';

const root = process.cwd();
const url = `file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`;
const widths = [320, 360, 390, 412, 768, 820, 1024, 1280, 1440, 1920];
const mode = process.argv[2] || 'audit';

const browser = await chromium.launch();
const results = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#boot-screen')?.classList.add('is-done'));
  const data = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowers = [...document.body.querySelectorAll('*')]
      .map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id,
          className: typeof el.className === 'string' ? el.className : '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter(item => item.width > 0 && (item.left < -1 || item.right > window.innerWidth + 1))
      .slice(0, 20);
    return {
      viewport: window.innerWidth,
      scrollWidth: doc.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      overflow: Math.max(doc.scrollWidth, document.body.scrollWidth) - window.innerWidth,
      overflowers
    };
  });
  results.push(data);
  if (mode === 'screenshots') {
    await page.screenshot({ path: `.agents/responsive-${process.argv[3] || 'shot'}-${width}.png`, fullPage: true });
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
