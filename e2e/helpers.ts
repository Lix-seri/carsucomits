import { expect, request as pwRequest, type APIRequestContext, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { PORT } from "../playwright.config";

export const BASE = `http://localhost:${PORT}`;
export const ADMIN = { email: "glen.licayan@carsu.edu.ph", password: "123456" };

const uniq = () => Math.random().toString(36).slice(2, 8);

/** A fresh cookie jar signed in as a newly registered user. */
export async function newUser(name: string) {
  const api = await pwRequest.newContext({ baseURL: BASE });
  const email = `${name.toLowerCase()}.${uniq()}@carsu.edu.ph`;
  const res = await api.post("/api/auth/register", { data: { fullName: `${name} Tester`, email, password: "password123" } });
  expect(res.ok(), await res.text()).toBeTruthy();
  const { user } = await res.json();
  return { api, email, id: user.id as string, name: `${name} Tester` };
}

export async function adminApi(): Promise<APIRequestContext> {
  const api = await pwRequest.newContext({ baseURL: BASE });
  const res = await api.post("/api/auth/login", { data: { ...ADMIN, expectedRole: "ADMIN" } });
  expect(res.ok(), await res.text()).toBeTruthy();
  return api;
}

export async function postCommission(api: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const res = await api.post("/api/commissions", {
    data: {
      title: "Design a poster for our org fair",
      description: "A3 poster, two revisions, source files included.",
      category: "TECHNICAL",
      requiredLevel: "INTERMEDIATE",
      fareMin: 500,
      fareMax: 800,
      ...overrides,
    },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return (await res.json()).commission as { id: string; title: string };
}

/** Signs the page's browser context in (API and page share cookies). */
export async function signInPage(page: Page, creds: { email: string; password: string }, expectedRole = "STUDENT") {
  const res = await page.request.post("/api/auth/login", { data: { ...creds, expectedRole } });
  expect(res.ok(), await res.text()).toBeTruthy();
}

/** Visits a page, asserts it rendered without a server or client error, and screenshots it. */
export async function visit(page: Page, path: string, shotName: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto(path);
  expect(res?.status(), `${path} status`).toBeLessThan(400);
  await expect(page.locator("body")).not.toContainText(/Application error|Unhandled Runtime Error|Internal Server Error/);
  await page.screenshot({ path: `test-results/screens/${shotName}.png`, fullPage: true });
  expect(errors, `${path} threw in the browser`).toEqual([]);
}

/** Direct access to the test database, for states the API can't reach without Blob uploads. */
export function testDb() {
  return new PrismaClient({
    datasources: { db: { url: process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/carsucomits_test" } },
  });
}

/** poster posts, worker applies, poster accepts → an IN_PROGRESS commission. */
export async function hiredCommission() {
  const poster = await newUser("Poster");
  const worker = await newUser("Worker");
  const c = await postCommission(poster.api);
  const app = await (await worker.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).json();
  expect((await poster.api.post(`/api/applications/${app.application.id}/accept`)).ok()).toBeTruthy();
  return { poster, worker, c };
}
