// Regenerates every image of the site from the official art of the game.
//
// - Hero and gallery: web versions (WebP) of the images in COVER-UFFICIALE/,
//   resized with ImageMagick (`convert`).
// - Open Graph image and favicons: drawn by the game compositions
//   (GAME/preview.html, the same ones used by GAME/scripts/export-art.mjs),
//   captured with Playwright. Requires the game dev server running:
//     cd GAME && npm run dev
//   and Playwright with a Chromium (npm i -D playwright && npx playwright install chromium).
//
//   node scripts/export-images.mjs [http://localhost:3000]
import { copyFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(site, '..');
const covers = path.join(repo, 'COVER-UFFICIALE');
const pub = path.join(site, 'public');
const images = path.join(pub, 'image');
const base = process.argv[2] ?? 'http://localhost:3000';

mkdirSync(images, { recursive: true });

const convert = (...args) => execFileSync('convert', args);
const webp = ['-strip', '-quality', '82', '-define', 'webp:method=6'];

// [source in COVER-UFFICIALE, output name, widths]
const resized = [
  ['key-art-3840x2160.png', 'keyart', [1280, 1920, 2560, 3840]],
  ['cover-orizzontale-2752x1536.png', 'cover-orizzontale', [960, 1600, 2560]],
  ['cover-verticale-1696x2528.png', 'cover-verticale', [600, 1200]],
  ['poster-27x40-1800x2667.png', 'poster', [600, 1200]],
  ['key-art-alba-1920x1080.png', 'keyart-alba', [960, 1920]],
  ['key-art-notte-1920x1080.png', 'keyart-notte', [960, 1920]],
];

for (const [source, name, widths] of resized) {
  for (const width of widths) {
    const out = path.join(images, `${name}-${width}.webp`);
    convert(path.join(covers, source), '-resize', `${width}x`, ...webp, out);
    console.log('✓', path.relative(site, out));
  }
}

// Phones in portrait: a 9:16 crop of the 4K key art centered on the road and
// the sun (x = 1240 of 1920, the same framing as the game's vertical covers).
for (const width of [720, 1080]) {
  const out = path.join(images, `keyart-verticale-${width}.webp`);
  convert(path.join(covers, 'key-art-3840x2160.png'), '-crop', '1215x2160+1873+0', '+repage', '-resize', `${width}x`, ...webp, out);
  console.log('✓', path.relative(site, out));
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright non è installato: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const tmp = path.join(tmpdir(), 'tsp-site-export');
mkdirSync(tmp, { recursive: true });

// [query, CSS width, CSS height, device scale, output]
const shots = [
  // 1200×630 (1.905:1): the 16:9 cover composition, captured larger and downscaled for clean text.
  ['art=cover-landscape', 1920, 1008, 1.25, path.join(tmp, 'og.png')],
  ['art=icon&simple=1', 16, 16, 1, path.join(tmp, 'favicon-16.png')],
  ['art=icon&simple=1', 32, 32, 1, path.join(tmp, 'favicon-32.png')],
  ['art=icon&simple=1', 48, 48, 1, path.join(pub, 'favicon-48.png')],
  // iOS rounds the corners itself: square tile, no transparency.
  ['art=icon&square=1', 180, 180, 1, path.join(pub, 'apple-touch-icon.png')],
];

const browser = await chromium.launch();
for (const [query, width, height, scale, out] of shots) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(`${base}/preview.html?${query}`, { waitUntil: 'networkidle' });
  await page.evaluate('document.fonts.ready');
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, omitBackground: query.startsWith('art=icon') });
  await page.close();
}
await browser.close();

convert(path.join(tmp, 'og.png'), '-resize', '1200x630!', '-strip', '-sampling-factor', '4:4:4', '-quality', '90', path.join(images, 'og-preview.jpg'));
convert(path.join(tmp, 'favicon-16.png'), path.join(tmp, 'favicon-32.png'), path.join(pub, 'favicon-48.png'), path.join(pub, 'favicon.ico'));
copyFileSync(path.join(repo, 'GAME/public/favicon.svg'), path.join(pub, 'favicon.svg'));
rmSync(tmp, { recursive: true, force: true });
for (const file of ['image/og-preview.jpg', 'favicon.ico', 'favicon.svg', 'favicon-48.png', 'apple-touch-icon.png']) console.log('✓', `public/${file}`);
