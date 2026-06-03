#!/usr/bin/env node
/**
 * 広告画像レンダラ（ストーリー用 9:16）
 * ads/templates/ad-{A|B}-template.html を Playwright で 1080x1920 で撮影
 * 出力:
 *   ad-A → ads/output/ad-A-main-story.jpg     (好きを仕事に)
 *   ad-B → ads/output/ad-B-seminar-story.jpg  (WEB会社説明会)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TEMPLATES = [
  { key: 'A', file: 'ad-A-template.html', output: 'ad-A-main-story.jpg'    },
  { key: 'B', file: 'ad-B-template.html', output: 'ad-B-seminar-story.jpg' },
];

(async () => {
  const browser = await chromium.launch();
  const ROOT = path.resolve(__dirname);
  const OUTPUT = path.join(ROOT, 'output');
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  for (const tpl of TEMPLATES) {
    const tplPath = path.join(ROOT, 'templates', tpl.file);
    if (!fs.existsSync(tplPath)) {
      console.log(`  ⊘ skip: ${tpl.file} (not found)`);
      continue;
    }
    const url = 'file:///' + tplPath.replace(/\\/g, '/');

    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(url);
    await page.evaluate(() => { document.body.className = 's9x16'; });
    await page.waitForTimeout(400);

    const outFile = path.join(OUTPUT, tpl.output);
    await page.screenshot({
      path: outFile,
      type: 'jpeg',
      quality: 92,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1080, height: 1920 },
    });
    console.log(`✓ ${tpl.output} (1080x1920)`);

    await context.close();
  }

  await browser.close();
  console.log('\n✅ レンダリング完了');
})();
