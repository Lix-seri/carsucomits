import { request } from "@playwright/test";
import { test, expect } from "./fixtures";
import { ADMIN, BASE, newUser, postCommission, signInPage, usedOfficer } from "./helpers";

// Phase 5 items 7 (CSU Main naming, decision 0015) and 8 (routing).

test.describe("item 7: one name for the university", () => {
  test("the footer, page title and commission meta use the standard names", async ({ page }) => {
    const poster = await newUser("Namer");
    const c = await postCommission(poster.api);
    await page.goto("/");
    await expect(page).toHaveTitle(/CSU Main/);
    await expect(page.getByRole("contentinfo")).toContainText("Caraga State University – Main Campus");
    await page.goto(`/commission/${c.id}`);
    await expect(page.getByText("CSU Main", { exact: true })).toBeVisible();
  });
});

test.describe("item 8: routing", () => {
  test.skip(({ isMobile }) => isMobile, "redirect rules run once");

  test("renamed routes redirect permanently; guards send people to the right place", async ({ page }) => {
    const anon = await request.newContext({ baseURL: BASE, maxRedirects: 0 });
    for (const [from, to] of [["/commissioner", "/hiring"], ["/commissioner/post", "/hiring/post"], ["/admin/listings", "/admin/commissions"]]) {
      const res = await anon.get(from);
      expect(res.status(), from).toBe(308);
      expect(res.headers().location).toBe(to);
    }
    // Signed out: deep links go to sign-in and remember where you were going.
    await page.goto("/hiring/applicants");
    await expect(page).toHaveURL(/\/login\?next=%2Fhiring%2Fapplicants$/);

    // Each role lands on its own home, and can't wander into the others'.
    const student = await newUser("Router");
    await signInPage(page, { email: student.email, password: "password123" });
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard\?error=admin-only$/);
    await page.goto("/used");
    await expect(page).toHaveURL(/\/dashboard\?error=staff-only$/);

    const officer = await usedOfficer();
    await page.context().clearCookies();
    await signInPage(page, { email: officer.email, password: "password123" }, "ADMIN");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/used\?error=admin-only$/);

    await page.context().clearCookies();
    await signInPage(page, ADMIN, "ADMIN");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/admin$/);
    await expect((await anon.get("/no-such-page")).status()).toBe(404);
  });
});

test.describe("item 8: back navigation", () => {
  test("Back returns to the page you came from, or Browse for a deep link", async ({ page }) => {
    const poster = await newUser("Backer");
    const c = await postCommission(poster.api, { title: `Back button check ${Date.now()}` });
    const reader = await newUser("Reader");
    await signInPage(page, { email: reader.email, password: "password123" });

    await page.goto(`/commission/${c.id}`);
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/browse$/);

    // Arrive by clicking a link on another page of the site (a real navigation with a referrer).
    expect((await reader.api.post(`/api/saved/${c.id}`)).ok()).toBeTruthy();
    await page.goto("/saved");
    await page.getByRole("link", { name: new RegExp(c.title) }).click();
    await expect(page).toHaveURL(new RegExp(`/commission/${c.id}$`));
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/saved$/);
  });
});
