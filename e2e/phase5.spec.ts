import { test, expect } from "@playwright/test";
import { ADMIN, BASE, adminApi, newUser, postCommission, signInPage, testDb } from "./helpers";

// Phase 5 features (claude/decisions/0009–0015). API and database rules run once (desktop);
// the UI flows run on desktop and mobile.

test.describe("item 2: append-only audit log", () => {
  test.skip(({ isMobile }) => isMobile, "API and database checks run once");

  test("moderation is logged with before and after values, and the database refuses edits and deletes", async () => {
    const target = await newUser("Audited");
    const admin = await adminApi();
    expect((await admin.post(`/api/admin/users/${target.id}/action`, { data: { action: "WARN", reason: "Testing the audit log." } })).ok()).toBeTruthy();

    const db = testDb();
    const entry = await db.auditLog.findFirstOrThrow({ where: { action: "WARN", target: target.id } });
    expect(entry.before).toEqual({ status: "ACTIVE" });
    expect(entry.after).toEqual({ status: "WARNED" });

    await expect(db.auditLog.update({ where: { id: entry.id }, data: { action: "EDITED" } })).rejects.toThrow(/append-only/);
    await expect(db.auditLog.delete({ where: { id: entry.id } })).rejects.toThrow(/append-only/);
    await expect(db.$executeRawUnsafe(`TRUNCATE "AuditLog"`)).rejects.toThrow(/append-only/);
    await db.$disconnect();
  });

  test("only admins can open the activity log", async ({ page }) => {
    const student = await newUser("Nosy");
    await signInPage(page, { email: student.email, password: "password123" });
    await page.goto("/admin/logs");
    await expect(page).not.toHaveURL(/\/admin\/logs/);
  });
});

test.describe("item 2: activity log UI", () => {
  test("an admin sees who changed what, from and to", async ({ page }) => {
    const target = await newUser("Logged");
    const admin = await adminApi();
    await admin.post(`/api/admin/users/${target.id}/action`, { data: { action: "SUSPEND", reason: "Audit log UI test." } });
    await signInPage(page, ADMIN, "ADMIN");
    await page.goto("/admin/logs?action=SUSPEND");
    const row = page.getByRole("listitem").filter({ hasText: "Logged Tester" }).first();
    await expect(row).toContainText("suspended");
    await expect(row).toContainText("ACTIVE");
    await expect(row).toContainText("SUSPENDED");
    await expect(row).toContainText("Audit log UI test.");
  });
});

test.describe("item 3: limits on applying and holding", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");
  const defaults = { MAX_PENDING_APPLICATIONS: 5, MAX_ACTIVE_JOBS: 2 };

  test("only admins change limits; values are validated and every change is audit-logged", async () => {
    const student = await newUser("Limiter");
    expect((await student.api.put("/api/admin/settings", { data: defaults })).status()).toBe(403);
    const admin = await adminApi();
    const bad = await admin.put("/api/admin/settings", { data: { ...defaults, MAX_ACTIVE_JOBS: 0 } });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).field).toBe("MAX_ACTIVE_JOBS");
    try {
      expect((await admin.put("/api/admin/settings", { data: { ...defaults, MAX_ACTIVE_JOBS: 3 } })).ok()).toBeTruthy();
      const db = testDb();
      const entry = await db.auditLog.findFirstOrThrow({ where: { action: "SETTING_CHANGED", target: "MAX_ACTIVE_JOBS" }, orderBy: { createdAt: "desc" } });
      expect(entry.before).toEqual({ MAX_ACTIVE_JOBS: 2 });
      expect(entry.after).toEqual({ MAX_ACTIVE_JOBS: 3 });
      await db.$disconnect();
    } finally {
      await admin.put("/api/admin/settings", { data: defaults });
    }
  });

  test("the pending cap and the job cap are enforced on apply and on hire", async () => {
    const admin = await adminApi();
    await admin.put("/api/admin/settings", { data: { MAX_PENDING_APPLICATIONS: 1, MAX_ACTIVE_JOBS: 1 } });
    try {
      const poster = await newUser("CapPoster");
      const worker = await newUser("CapWorker");
      const [a, b, c] = [await postCommission(poster.api), await postCommission(poster.api), await postCommission(poster.api)];

      const first = await worker.api.post(`/api/commissions/${a.id}/apply`, { data: {} });
      expect(first.ok()).toBeTruthy();
      const second = await worker.api.post(`/api/commissions/${b.id}/apply`, { data: {} });
      expect(second.status()).toBe(409);
      expect((await second.json()).error).toMatch(/1 application waiting/);

      // Hired on the first: the pending slot frees up, but the one job slot is now taken.
      const { application } = await first.json();
      expect((await poster.api.post(`/api/applications/${application.id}/accept`)).ok()).toBeTruthy();
      const third = await worker.api.post(`/api/commissions/${c.id}/apply`, { data: {} });
      expect(third.status()).toBe(409);
      expect((await third.json()).error).toMatch(/working on 1 commission/);
    } finally {
      await admin.put("/api/admin/settings", { data: defaults });
    }
  });
});

test.describe("item 3: limits UI", () => {
  test("an admin edits limits and a student who hits one is told why", async ({ page, browser }) => {
    await signInPage(page, ADMIN, "ADMIN");
    await page.goto("/admin/settings");
    const pending = page.getByLabel("Pending applications per student");
    await pending.fill("0");
    await page.getByRole("button", { name: "Save limits" }).click();
    await expect(page.getByText("The lowest allowed value is 1.")).toBeVisible();
    await pending.fill("1");
    await page.getByRole("button", { name: "Save limits" }).click();
    await expect(page.getByText(/Saved\./)).toBeVisible();
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}/phase5-settings.png`, fullPage: true });

    try {
      const poster = await newUser("UiCapPoster");
      const worker = await newUser("UiCapWorker");
      const first = await postCommission(poster.api);
      const second = await postCommission(poster.api, { title: `Second commission ${Date.now()}` });
      expect((await worker.api.post(`/api/commissions/${first.id}/apply`, { data: {} })).ok()).toBeTruthy();

      const ctx = await browser.newContext({ ...test.info().project.use, baseURL: BASE });
      const w = await ctx.newPage();
      await signInPage(w, { email: worker.email, password: "password123" });
      await w.goto(`/commission/${second.id}`);
      const dialog = w.getByRole("dialog", { name: "Apply to this commission" });
      await expect(async () => {
        await w.getByRole("button", { name: /Apply Now/ }).click();
        await expect(dialog).toBeVisible({ timeout: 2_000 });
      }).toPass();
      await dialog.getByRole("button", { name: "Submit Application" }).click();
      await expect(dialog.getByRole("alert")).toContainText("1 application waiting for a decision");
      await ctx.close();
    } finally {
      await pending.fill("5");
      await page.getByRole("button", { name: "Save limits" }).click();
      await expect(page.getByText(/Saved\./)).toBeVisible();
    }
  });
});
