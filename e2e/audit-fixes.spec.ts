import { test, expect } from "@playwright/test";
import { hiredCommission, newUser, postCommission, testDb } from "./helpers";

// Regression tests for the Phase 2 audit fixes (claude/audits/AUDIT_2026-09-25.md). API-level, desktop only.
test.describe("audit fixes", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("H2: a commission with an approved deliverable (AWAITING_REVIEW) can be completed", async () => {
    const { poster, c } = await hiredCommission();
    const db = testDb();
    await db.commission.update({ where: { id: c.id }, data: { status: "AWAITING_REVIEW" } });
    const res = await poster.api.post(`/api/commissions/${c.id}/complete`, { data: { stars: 5 } });
    expect(res.ok(), await res.text()).toBeTruthy();
    expect((await db.commission.findUnique({ where: { id: c.id } }))?.status).toBe("COMPLETED");
    await db.$disconnect();
  });
});

test.describe("audit fixes: auth and reports", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("H7: MFA setup is refused while MFA is on", async () => {
    const { TOTP, Secret } = await import("otpauth");
    const me = await newUser("Mfa");
    const setup = await (await me.api.post("/api/auth/mfa/setup")).json();
    const code = new TOTP({ secret: Secret.fromBase32(setup.secret), digits: 6, period: 30 }).generate();
    expect((await me.api.post("/api/auth/mfa/enable", { data: { code } })).ok()).toBeTruthy();
    expect((await me.api.post("/api/auth/mfa/setup")).status()).toBe(409);
  });

  test("H8: a reported user doesn't learn who reported them", async () => {
    const reporter = await newUser("Reporter");
    const target = await newUser("Target");
    const res = await reporter.api.post("/api/reports", { data: { reporteeEmail: target.email, reason: "Ghosting", details: "No reply for a week." } });
    expect(res.ok(), await res.text()).toBeTruthy();
    const mine = await (await target.api.get("/api/reports/mine")).json();
    expect(mine.aboutMe).toHaveLength(1);
    expect(JSON.stringify(mine.aboutMe)).not.toContain("Reporter");
    expect(mine.aboutMe[0].reporter).toBeUndefined();
  });
});

test.describe("audit fixes: sign-in throttling", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("H6: five wrong passwords lock the account for 15 minutes, even for the right password", async () => {
    const me = await newUser("Locked");
    for (let i = 0; i < 5; i++) {
      expect((await me.api.post("/api/auth/login", { data: { email: me.email, password: "wrong-password" } })).status()).toBe(401);
    }
    const res = await me.api.post("/api/auth/login", { data: { email: me.email, password: "password123" } });
    expect(res.status()).toBe(429);
    expect((await res.json()).error).toMatch(/Too many failed sign-in attempts/);
  });

  test("H6: a successful sign-in resets the count", async () => {
    const me = await newUser("Reset");
    const wrong = () => me.api.post("/api/auth/login", { data: { email: me.email, password: "wrong-password" } });
    const right = () => me.api.post("/api/auth/login", { data: { email: me.email, password: "password123" } });
    for (let i = 0; i < 4; i++) await wrong();
    expect((await right()).ok()).toBeTruthy();
    // 8 failures in the window, but only 4 since the last success: still allowed.
    for (let i = 0; i < 4; i++) expect((await wrong()).status()).toBe(401);
    expect((await right()).ok()).toBeTruthy();
  });
});

test.describe("audit fixes: ratings", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("M9: a rating can't be changed once given", async () => {
    const { poster, worker, c } = await hiredCommission();
    expect((await poster.api.post(`/api/commissions/${c.id}/complete`, { data: { stars: 5 } })).ok()).toBeTruthy();
    expect((await poster.api.post(`/api/commissions/${c.id}/rate-now`, { data: { stars: 1, comment: "Changed my mind entirely." } })).status()).toBe(409);
    expect((await worker.api.post(`/api/ratings/commissioner`, { data: { commissionId: c.id, stars: 4 } })).ok()).toBeTruthy();
    expect((await worker.api.post(`/api/ratings/commissioner`, { data: { commissionId: c.id, stars: 5 } })).status()).toBe(409);
  });
});

test.describe("audit fixes: applications", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("M7: withdrawing and re-applying reopens the application", async () => {
    const poster = await newUser("Poster");
    const worker = await newUser("Worker");
    const c = await postCommission(poster.api);
    const first = await (await worker.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).json();
    expect((await worker.api.post(`/api/applications/${first.application.id}/withdraw`)).ok()).toBeTruthy();
    const again = await worker.api.post(`/api/commissions/${c.id}/apply`, { data: { coverLetter: "Back again." } });
    expect(again.ok(), await again.text()).toBeTruthy();
    const body = await again.json();
    expect(body.application.id).toBe(first.application.id);
    expect(body.application.status).toBe("PENDING");
    expect((await worker.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).status()).toBe(409);
  });
});

test.describe("audit fixes: routing", () => {
  test("M1: signed-out visitors go to login and come back to the page they wanted", async ({ page }) => {
    const me = await newUser("Next");
    await page.goto("/hub");
    await expect(page).toHaveURL(/\/login\?next=%2Fhub$/);
    await page.getByPlaceholder("youremail@carsu.edu.ph").fill(me.email);
    await page.getByPlaceholder("Enter your password").fill("password123");
    await page.getByRole("button", { name: "Login as Student" }).click();
    await expect(page).toHaveURL(/\/hub$/);
    // Signed in, the login page sends you home instead.
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("audit fixes: links", () => {
  test("M2: unknown pages show the 404 page, and header/footer links all resolve", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();

    await page.goto("/");
    const hrefs = await page.locator("header a[href^='/'], footer a[href^='/']").evaluateAll((as) =>
      Array.from(new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!.split("#")[0] || "/"))),
    );
    for (const href of hrefs) {
      const r = await page.request.get(href, { maxRedirects: 0 });
      expect(r.status(), href).toBeLessThan(400);
    }
  });
});
