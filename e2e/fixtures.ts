import { test as base, type BrowserContext, type Page } from "@playwright/test";

/**
 * Makes page.goto and page.reload wait until React has hydrated (the app sets
 * <html data-hydrated>), so the next click isn't lost. Use it on pages from new contexts too.
 */
export function waitForHydration(page: Page) {
  const ready = () => page.waitForSelector("html[data-hydrated]", { state: "attached" });
  const goto = page.goto.bind(page);
  const reload = page.reload.bind(page);
  page.goto = async (...args) => { const res = await goto(...args); await ready(); return res; };
  page.reload = async (...args) => { const res = await reload(...args); await ready(); return res; };
  return page;
}

export const test = base.extend<{ closeExtraContexts: void }>({
  page: async ({ page }, provide) => { await provide(waitForHydration(page)); },
  // Every context a test opens is closed when it ends, pass or fail. Left open, their pages keep
  // polling notifications and messages and slow the server down for every later test.
  closeExtraContexts: [
    async ({ browser }, provide) => {
      const opened: BrowserContext[] = [];
      const newContext = browser.newContext.bind(browser);
      browser.newContext = async (...args) => {
        const ctx = await newContext(...args);
        opened.push(ctx);
        return ctx;
      };
      await provide();
      browser.newContext = newContext;
      await Promise.all(opened.map((c) => c.close().catch(() => {})));
    },
    { auto: true },
  ],
});
export { expect } from "@playwright/test";
