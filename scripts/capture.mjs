// Design review captures: full-page screenshots of the given paths at the review widths,
// in light and dark, into .impeccable/review/<label>/. Needs a running server (default :3100).
// Usage: node scripts/capture.mjs <label> <path...> [--as student|admin] [--widths 360,1440] [--dark]
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const as = flag("--as");
const widths = (flag("--widths") ?? "360,768,1024,1440").split(",").map(Number);
const darkToo = args.includes("--dark") ? (args.splice(args.indexOf("--dark"), 1), true) : false;
const [label, ...paths] = args;
const BASE = process.env.BASE ?? "http://localhost:3100";
const out = `.impeccable/review/${label}`;
mkdirSync(out, { recursive: true });

const creds = {
  student: { email: "ana.reyes@carsu.edu.ph", password: "password123", expectedRole: "STUDENT" },
  admin: { email: "glen.licayan@carsu.edu.ph", password: readFileSync(".env", "utf8").match(/^SEED_ADMIN_PASSWORD=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, ""), expectedRole: "ADMIN" },
};

const browser = await chromium.launch({ channel: "chrome" });
for (const scheme of darkToo ? ["light", "dark"] : ["light"]) {
  for (const width of widths) {
    const mobile = width < 500;
    const ctx = await browser.newContext({ viewport: { width, height: mobile ? 800 : 900 }, isMobile: mobile, hasTouch: mobile, colorScheme: scheme, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    if (as) {
      const res = await page.request.post(`${BASE}/api/auth/login`, { data: creds[as] });
      if (!res.ok()) throw new Error(`sign-in as ${as} failed: ${res.status()}`);
    }
    for (const p of paths) {
      await page.goto(BASE + p, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForSelector("html[data-hydrated]", { state: "attached", timeout: 15000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const name = p === "/" ? "home" : p.slice(1).replace(/[/?=&]/g, "_");
      await page.screenshot({ path: `${out}/${name}-${width}-${scheme}.png`, fullPage: true, caret: "initial" });
      if (overflow > 1) console.log(`OVERFLOW ${p} @${width} ${scheme}: ${overflow}px`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`captured into ${out}`);
