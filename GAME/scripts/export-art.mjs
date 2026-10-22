// Exports covers, poster and icons from the vector art (preview.html).
// Requirements: the dev server running (npm run dev) and Playwright with a
// Chromium (npm i -D playwright && npx playwright install chromium).
//   node scripts/export-art.mjs [http://localhost:3000]
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] ?? 'http://localhost:3000';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright non è installato: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const covers = path.resolve(root, '../COVER-UFFICIALE');
mkdirSync(covers, { recursive: true });

// [query, CSS width, CSS height, device scale, output, page zoom]
// Covers with odd sizes render at their exact pixel size, scaled with CSS zoom.
const jobs = [
  ['art=cover-landscape', 2752, 1536, 1, path.join(covers, 'cover-orizzontale-2752x1536.png'), 2752 / 1920],
  ['art=cover-portrait', 848, 1264, 2, path.join(covers, 'cover-verticale-1696x2528.png')],
  ['art=poster', 1800, 2667, 1, path.join(covers, 'poster-27x40-1800x2667.png'), 2],
  ['art=keyart&animated=0', 1920, 1080, 2, path.join(covers, 'key-art-3840x2160.png')],
  ['art=keyart&animated=0&variant=dawn', 1920, 1080, 1, path.join(covers, 'key-art-alba-1920x1080.png')],
  ['art=keyart&animated=0&variant=night', 1920, 1080, 1, path.join(covers, 'key-art-notte-1920x1080.png')],
  ['art=icon', 512, 512, 2, path.join(root, 'build/icon.png')],
  ['art=icon', 512, 512, 2, path.join(covers, 'icona-1024.png')],
  ['art=icon', 180, 180, 1, path.join(root, 'public/apple-touch-icon.png')],
  ['art=icon', 192, 192, 1, path.join(root, 'public/android-chrome-192.png')],
  ['art=icon&simple=1', 32, 32, 1, path.join(root, 'public/favicon-32x32.png')],
  ['art=icon&simple=1', 16, 16, 1, path.join(root, 'public/favicon-16x16.png')],
];

const browser = await chromium.launch();
for (const [query, width, height, scale, out, zoom] of jobs) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  if (zoom) await page.addInitScript({ content: `document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = '${zoom}'; });` });
  await page.goto(`${base}/preview.html?${query}`, { waitUntil: 'networkidle' });
  await page.evaluate('document.fonts.ready');
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, omitBackground: query.startsWith('art=icon') });
  console.log('✓', path.relative(path.resolve(root, '..'), out));
  await page.close();
}
await browser.close();

// Windows icon: several sizes in one .ico (ImageMagick, when available).
try {
  execFileSync('convert', [path.join(root, 'build/icon.png'), '-define', 'icon:auto-resize=256,128,64,48,32,16', path.join(root, 'build/icon.ico')]);
  console.log('✓ GAME/build/icon.ico');
} catch {
  console.warn('ImageMagick non trovato: build/icon.ico non aggiornato.');
}
