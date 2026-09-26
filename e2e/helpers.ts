import { expect, request as pwRequest, test, type APIRequestContext, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { PORT } from "../playwright.config";

export const BASE = `http://localhost:${PORT}`;
export const ADMIN = { email: "glen.licayan@carsu.edu.ph", password: "e2e-admin-password" };

let helperDb: PrismaClient | undefined;
const uniq = () => Math.random().toString(36).slice(2, 8);

/**
 * A fresh cookie jar signed in as a newly registered user. Users are CCIS-verified unless
 * `verified: false` (decision 0012), because most flows need someone who can take on work.
 */
export async function newUser(name: string, { verified = true } = {}) {
  const api = await pwRequest.newContext({ baseURL: BASE });
  const email = `${name.toLowerCase()}.${uniq()}@carsu.edu.ph`;
  const res = await api.post("/api/auth/register", { data: { fullName: `${name} Tester`, email, password: "password123" } });
  expect(res.ok(), await res.text()).toBeTruthy();
  const { user } = await res.json();
  if (verified) {
    helperDb ??= testDb();
    await helperDb.user.update({ where: { id: user.id }, data: { verifiedAt: new Date() } });
  }
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
  // No page may scroll sideways (wide tables scroll inside their own container). Compare with
  // the real viewport: on phones Chrome widens innerWidth to fit overflowing content.
  const overflow = (await page.evaluate(() => document.documentElement.scrollWidth)) - page.viewportSize()!.width;
  expect(overflow, `${path} is wider than the viewport`).toBeLessThanOrEqual(1);
  // caret: "initial" — Playwright's default hides the text cursor by injecting a style
  // attribute, which React reports as a hydration mismatch if hydration isn't done yet.
  await page.screenshot({ path: `test-results/screens/${shotName}.png`, fullPage: true, caret: "initial" });
  // React #418 in production builds: on ~2% of loads React discards the server HTML and
  // re-renders on the client (no visible effect). Not reproducible in dev, so the cause is
  // still open (audit L8). Recorded on the test instead of failing it; every other error fails.
  const recovered = errors.filter((e) => e.includes("Minified React error #418"));
  if (recovered.length) test.info().annotations.push({ type: "hydration-recovered", description: `${path} (audit L8)` });
  expect(errors.filter((e) => !recovered.includes(e)), `${path} threw in the browser`).toEqual([]);
}

/** Direct access to the test database, for states the API can't reach without Blob uploads. */
export function testDb() {
  return new PrismaClient({
    datasources: { db: { url: process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/carsucomits_test" } },
  });
}

/** Both parties accept the work agreement, which starts the commission. */
export async function acceptAgreement(commissionId: string, ...parties: APIRequestContext[]) {
  for (const api of parties) {
    const res = await api.post(`/api/commissions/${commissionId}/agreement`);
    expect(res.ok(), await res.text()).toBeTruthy();
  }
}

/** poster posts, worker applies, poster accepts, both accept the agreement → an IN_PROGRESS commission. */
export async function hiredCommission() {
  const poster = await newUser("Poster");
  const worker = await newUser("Worker");
  const c = await postCommission(poster.api);
  const app = await (await worker.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).json();
  expect((await poster.api.post(`/api/applications/${app.application.id}/accept`)).ok()).toBeTruthy();
  await acceptAgreement(c.id, poster.api, worker.api);
  return { poster, worker, c };
}

/** A tiny upload; the server checks the declared type and size, not the pixels. */
export const proofFile = (mimeType = "image/png") => ({ name: "student-id.png", mimeType, buffer: Buffer.from("not really a png; the declared type is what gets checked") });

/** A student promoted to USED officer by the admin, signed in on the staff (Admin) tab. */
export async function usedOfficer() {
  const u = await newUser("Officer");
  const admin = await adminApi();
  expect((await admin.post(`/api/admin/users/${u.id}/role`, { data: { role: "USED" } })).ok()).toBeTruthy();
  const login = await u.api.post("/api/auth/login", { data: { email: u.email, password: "password123", expectedRole: "ADMIN" } });
  expect(login.ok(), await login.text()).toBeTruthy();
  return u;
}
