import { test, expect, type Browser, type Page } from "@playwright/test";
import { ADMIN, BASE, newUser, postCommission, signInPage } from "./helpers";

// Main user flows, clicked through in the browser as each role, on desktop and mobile.
// Every step is screenshotted to test-results/screens/<project>/flow-*.png, and any native
// browser dialog (alert/confirm/prompt, "localhost says…") fails the test.

async function asUser(browser: Browser, creds: { email: string; password: string }, role = "STUDENT") {
  const ctx = await browser.newContext({ ...test.info().project.use, baseURL: BASE });
  const page = await ctx.newPage();
  forbidNativeDialogs(page);
  await signInPage(page, creds, role);
  return page;
}

function forbidNativeDialogs(page: Page) {
  page.on("dialog", async (d) => {
    await d.dismiss();
    throw new Error(`Native ${d.type()} dialog appeared: "${d.message()}"`);
  });
}

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `test-results/screens/${test.info().project.name}/flow-${name}.png`, fullPage: true, caret: "initial" });

test.describe("flows through the UI", () => {
  test.beforeEach(({ page }) => forbidNativeDialogs(page));

  test("visitor: home → category → commission → asked to sign in", async ({ page }) => {
    const poster = await newUser("Visitor");
    const c = await postCommission(poster.api, { title: `Visitor flow ${Date.now()}`, category: "GENERAL_ERRANDS" });
    await page.goto("/");
    await shot(page, "visitor-home");
    await page.getByRole("link", { name: /General Errands/ }).first().click();
    await expect(page.getByRole("button", { name: "General Errands" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("heading", { name: c.title }).waitFor();
    await shot(page, "visitor-browse-filtered");
    await page.goto(`/commission/${c.id}`);
    await page.getByRole("link", { name: "Login to apply" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("register with inline validation, then land on the dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await page.getByLabel("Full Name").fill("Flow Registrant");
    await page.getByLabel("CSU Email Address").fill("flow.registrant@gmail.com");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText("Use your @carsu.edu.ph email address.")).toBeVisible();
    await page.getByLabel("CSU Email Address").fill(`flow.${Date.now()}@carsu.edu.ph`);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm Password").fill("password124");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText("Passwords don't match.")).toBeVisible();
    await shot(page, "register-errors");
    await page.getByLabel("Confirm Password").fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("post → apply → accept → complete with rating → rate back → message → report", async ({ browser, page }) => {
    const posterUser = await newUser("Poster");
    const workerUser = await newUser("Worker");
    const poster = page;
    await signInPage(poster, { email: posterUser.email, password: "password123" });

    // Post, with a validation error first.
    await poster.goto("/commissioner/post");
    await expect(poster.getByText("No graded academic work.")).toBeVisible();
    const title = `Flow poster ${Date.now()}`;
    await poster.getByLabel("Title").fill(title);
    await poster.getByLabel("Category", { exact: true }).selectOption("TECHNICAL");
    await poster.getByLabel("Description").fill("Design an A3 poster for the org fair, two revisions included.");
    await poster.getByRole("button", { name: "Post Commission" }).click();
    await expect(poster.getByText("Minimum fare is required.")).toBeVisible();
    await expect(poster.getByLabel("Fare (min) ₱")).toBeFocused();
    await shot(poster, "post-errors");
    await poster.getByLabel("Fare (min) ₱").fill("500");
    await poster.getByRole("button", { name: "Post Commission" }).click();
    await expect(poster.getByRole("heading", { name: title })).toBeVisible();
    const commissionUrl = poster.url();

    // Worker applies through the dialog.
    const worker = await asUser(browser, { email: workerUser.email, password: "password123" });
    await worker.goto(commissionUrl);
    await worker.getByRole("button", { name: /Apply Now/ }).click();
    const applyDialog = worker.getByRole("dialog", { name: "Apply to this commission" });
    await applyDialog.getByLabel(/Cover letter/).fill("I design posters for three orgs.");
    await shot(worker, "apply-dialog");
    await applyDialog.getByRole("button", { name: "Submit Application" }).click();
    await expect(worker).toHaveURL(/\/hub$/);
    await expect(worker.getByRole("link", { name: title })).toBeVisible();

    // Poster accepts through the confirm dialog.
    await poster.goto("/commissioner/applicants");
    await poster.getByRole("button", { name: "Accept" }).first().click();
    const acceptDialog = poster.getByRole("dialog", { name: /Accept Worker Tester/ });
    await shot(poster, "accept-confirm");
    await acceptDialog.getByRole("button", { name: "Accept applicant" }).click();
    await expect(acceptDialog).toBeHidden();

    // Poster completes: 2 stars without feedback is refused inline, then 5 stars.
    await poster.goto("/hub");
    await poster.getByRole("button", { name: /Mark Complete & Review/ }).first().click();
    const rate = poster.getByRole("dialog", { name: "Rate & mark complete" });
    await rate.getByRole("radio", { name: "2 stars" }).click();
    await rate.getByRole("button", { name: "Submit rating & complete" }).click();
    await expect(rate.getByText(/at least 10 characters of feedback/)).toBeVisible();
    await shot(poster, "rating-error");
    await rate.getByRole("radio", { name: "5 stars" }).click();
    await rate.getByRole("button", { name: "Submit rating & complete" }).click();
    await expect(rate).toBeHidden();
    await poster.goto(commissionUrl);
    await expect(poster.getByText("COMPLETED")).toBeVisible();

    // Worker rates the commissioner back.
    await worker.goto("/hub");
    await worker.getByRole("button", { name: /Rate the commissioner/ }).click();
    const back = worker.getByRole("dialog", { name: "Rate the commissioner" });
    await back.getByRole("radio", { name: "4 stars" }).click();
    await back.getByRole("button", { name: "Submit rating" }).click();
    await expect(back).toBeHidden();

    // Messaging from the public profile.
    await worker.goto(`/u/${posterUser.id}`);
    await worker.getByRole("link", { name: "Message" }).click();
    await worker.getByLabel("Message", { exact: true }).fill("Thanks, it was a pleasure!");
    await worker.getByRole("button", { name: "Send message" }).click();
    await expect(worker.getByText("Thanks, it was a pleasure!").last()).toBeVisible();
    await shot(worker, "messages");

    // Report through the site dialog, with inline validation.
    await worker.goto("/reports");
    await worker.getByRole("button", { name: /Submit New Report/ }).click();
    const report = worker.getByRole("dialog", { name: "Submit a report" });
    await report.getByLabel("Reported user's email").fill(posterUser.email);
    await report.getByRole("button", { name: "Submit" }).click();
    await expect(report.getByText("Choose a reason.")).toBeVisible();
    await report.getByLabel("Reason").selectOption("Payment Dispute");
    await report.getByLabel("What happened?").fill("Paid late, but settled in the end.");
    await shot(worker, "report-dialog");
    await report.getByRole("button", { name: "Submit" }).click();
    await expect(report).toBeHidden();
    await expect(worker.getByText(`You reported ${posterUser.name}`)).toBeVisible();
  });

  test("admin: sign in on the Admin tab, suspend a user, resolve a report", async ({ browser, page }) => {
    const target = await newUser("Suspendee");
    const reporter = await newUser("Reporter");
    await reporter.api.post("/api/reports", { data: { reporteeEmail: target.email, reason: "Scam", details: "Took payment, never delivered." } });

    await page.goto("/login");
    await page.getByRole("button", { name: "Admin" }).click();
    await page.getByLabel("CSU Email Address").fill(ADMIN.email);
    await page.getByLabel("Password", { exact: true }).fill(ADMIN.password);
    await page.getByRole("button", { name: "Login as Admin" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto(`/admin/users?q=${encodeURIComponent(target.email)}`);
    await page.getByRole("button", { name: "Suspend" }).click();
    const confirm = page.getByRole("dialog", { name: "Suspend this user?" });
    await shot(page, "admin-suspend-confirm");
    await confirm.getByRole("button", { name: "Suspend" }).click();
    await expect(confirm).toBeHidden();
    await expect(page.getByText("SUSPENDED").first()).toBeVisible();

    // The suspended user's session stops working immediately.
    const suspended = await browser.newContext({ baseURL: BASE });
    const res = await suspended.request.post("/api/auth/login", { data: { email: target.email, password: "password123" } });
    expect(res.status()).toBe(403);

    await page.goto("/admin/reports");
    await page.getByRole("button", { name: "Resolve" }).first().click();
    await expect(page.getByText("RESOLVED").first()).toBeVisible();
  });
});
