import { test as base, type Page } from "@playwright/test";

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

export const test = base.extend({
  page: async ({ page }, provide) => { await provide(waitForHydration(page)); },
});
export { expect } from "@playwright/test";
