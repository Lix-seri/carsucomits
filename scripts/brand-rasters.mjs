// Renders the brand rasters from the SVG marks in public/brand (favicons and the wordmark),
// using headless Chrome so the wordmark is set in the real Bricolage Grotesque.
// Run: node scripts/brand-rasters.mjs
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const mark = readFileSync("public/brand/carsucomits-mark.svg", "utf8");
const onDark = readFileSync("public/brand/carsucomits-mark-on-dark.svg", "utf8");
const FONT = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=block";

const browser = await chromium.launch({ channel: process.env.CI ? undefined : "chrome" });
const page = await browser.newPage();

async function shot(html, width, height, out, transparent = true) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${FONT}"><style>
    html,body{margin:0;background:transparent}
    .row{display:flex;align-items:center;gap:${Math.round(height * 0.22)}px;height:${height}px;padding:0 ${Math.round(height * 0.2)}px;box-sizing:border-box}
    .row svg{height:${Math.round(height * 0.78)}px;width:${Math.round(height * 0.78)}px}
    .word{font-family:"Bricolage Grotesque";font-weight:800;letter-spacing:-0.035em;font-size:${Math.round(height * 0.52)}px}
  </style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: transparent, clip: { x: 0, y: 0, width, height } });
}

const square = (svg, size) => `<div style="width:${size}px;height:${size}px">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</div>`;
for (const [size, file] of [[16, "favicon-16.png"], [32, "favicon-32.png"], [180, "apple-touch-icon.png"], [512, "icon-512.png"]]) {
  await shot(square(mark, size), size, size, `public/brand/${file}`);
}
// Wordmarks: "CarSU" in ink / chalk, "Comits" in board green / gold.
const word = (svg, ink, accent) =>
  `<div class="row">${svg}<span class="word" style="color:${ink}">CarSU<span style="color:${accent}">Comits</span></span></div>`;
await shot(word(mark, "#1D2621", "#1B6644"), 760, 160, "public/brand/carsucomits-wordmark.png");
await shot(word(onDark, "#F6F2E6", "#F4C542"), 760, 160, "public/brand/carsucomits-wordmark-on-dark.png");
await browser.close();

writeFileSync("public/brand/README.md", `# CarSUComits brand files

Original artwork for CarSUComits, a student-built marketplace. It is not a university mark: never pair it with, or substitute it for, the CSU seal.

| File | Use |
|---|---|
| carsucomits-mark.svg | Icon-only mark in colour (board green slip, chalk check, gold magnet) |
| carsucomits-mark-on-dark.svg | Mark on dark grounds (admin sidebar, dark mode, board panels) |
| carsucomits-mark-mono.svg | Single colour; the check is cut out, so it takes \`currentColor\` |
| carsucomits-wordmark.png · -on-dark.png | Full lockup set in Bricolage Grotesque ExtraBold |
| favicon-16.png · favicon-32.png · apple-touch-icon.png (180) · icon-512.png | App and browser icons |

The PNGs are rendered from the SVGs by \`node scripts/brand-rasters.mjs\`. In the app, the lockup is drawn live by \`src/components/layout/logo.tsx\`.
`);
console.log("brand rasters written");
