import { test, expect, waitForHydration } from "./fixtures";
import { ADMIN, BASE, adminApi, hiredCommission, newUser, postCommission, proofFile, signInPage, testDb, usedOfficer } from "./helpers";

// Phase 5 items 1, 4, 6 and 11 (claude/decisions/0012, 0014). API rules run once (desktop);
// the UI flows run on desktop and mobile.

test.describe("item 6: CCIS verification", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("unverified students can't apply; a request is validated, reviewed by staff, and unlocks applying", async () => {
    const poster = await newUser("VerPoster");
    const student = await newUser("Unverified", { verified: false });
    const c = await postCommission(poster.api);

    const refused = await student.api.post(`/api/commissions/${c.id}/apply`, { data: {} });
    expect(refused.status()).toBe(403);
    expect((await refused.json()).error).toMatch(/verified CCIS students/);

    const missing = await student.api.post("/api/verification", { multipart: { studentIdNumber: "2021-00123", proof: proofFile() } });
    expect(missing.status()).toBe(400);
    expect((await missing.json()).field).toBe("ccis");
    const wrongType = await student.api.post("/api/verification", { multipart: { studentIdNumber: "2021-00123", ccis: "on", proof: proofFile("text/html") } });
    expect((await wrongType.json()).field).toBe("proof");
    const badId = await student.api.post("/api/verification", { multipart: { studentIdNumber: "abc", ccis: "on", proof: proofFile() } });
    expect((await badId.json()).field).toBe("studentIdNumber");

    const sent = await student.api.post("/api/verification", { multipart: { studentIdNumber: "2021-00123", ccis: "on", proof: proofFile() } });
    expect(sent.ok(), await sent.text()).toBeTruthy();
    const { request } = await sent.json();
    expect((await student.api.post("/api/verification", { multipart: { studentIdNumber: "2021-00123", ccis: "on", proof: proofFile() } })).status()).toBe(409);

    // The proof is private: staff only.
    expect((await student.api.get(`/api/verification/${request.id}/proof`)).status()).toBe(403);
    expect((await student.api.post(`/api/verification/${request.id}/decision`, { data: { decision: "APPROVE" } })).status()).toBe(403);
    const admin = await adminApi();
    const proof = await admin.get(`/api/verification/${request.id}/proof`);
    expect(proof.headers()["content-type"]).toBe("image/png");
    expect(proof.headers()["cache-control"]).toContain("no-store");

    expect((await admin.post(`/api/verification/${request.id}/decision`, { data: { decision: "REJECT" } })).status()).toBe(400);
    expect((await admin.post(`/api/verification/${request.id}/decision`, { data: { decision: "APPROVE" } })).ok()).toBeTruthy();
    expect((await student.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).ok()).toBeTruthy();

    const db = testDb();
    const entry = await db.auditLog.findFirstOrThrow({ where: { action: "VERIFICATION_APPROVED", target: student.id } });
    expect(entry.before).toEqual({ status: "PENDING" });
    expect(entry.after).toEqual({ status: "APPROVED" });
    await db.$disconnect();
  });
});

test.describe("item 11: USED officers", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("only admins assign the role; it's audited; USED officers oversee sellers but can't moderate", async () => {
    const student = await newUser("Wannabe");
    expect((await student.api.post(`/api/admin/users/${student.id}/role`, { data: { role: "USED" } })).status()).toBe(403);

    const officer = await usedOfficer();
    const db = testDb();
    const roleEntry = await db.auditLog.findFirstOrThrow({ where: { action: "ROLE_CHANGED", target: officer.id } });
    expect(roleEntry.before).toEqual({ role: "STUDENT_EMPLOYEE" });
    expect(roleEntry.after).toEqual({ role: "USED" });

    // No admin powers.
    expect((await officer.api.post(`/api/admin/users/${student.id}/role`, { data: { role: "USED" } })).status()).toBe(403);
    expect((await officer.api.post(`/api/admin/users/${student.id}/action`, { data: { action: "WARN", reason: "Not allowed here." } })).status()).toBe(403);
    expect((await officer.api.put("/api/admin/settings", { data: { MAX_PENDING_APPLICATIONS: 5, MAX_ACTIVE_JOBS: 2 } })).status()).toBe(403);

    // Seller oversight: suspending blocks applying, reinstating restores it.
    const seller = await newUser("Seller", { verified: false });
    const { request } = await (await seller.api.post("/api/verification", { multipart: { studentIdNumber: "2020-04567", ccis: "on", proof: proofFile() } })).json();
    expect((await officer.api.post(`/api/verification/${request.id}/decision`, { data: { decision: "APPROVE" } })).ok()).toBeTruthy();
    expect((await officer.api.post(`/api/sellers/${seller.id}/status`, { data: { action: "SUSPEND", reason: "x" } })).status()).toBe(400);
    expect((await officer.api.post(`/api/sellers/${seller.id}/status`, { data: { action: "SUSPEND", reason: "Took payment and ghosted twice." } })).ok()).toBeTruthy();
    const poster = await newUser("SellPoster");
    const c = await postCommission(poster.api);
    expect((await seller.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).status()).toBe(403);
    const suspended = await db.auditLog.findFirstOrThrow({ where: { action: "SELLER_SUSPENDED", target: seller.id } });
    expect(suspended.after).toEqual({ seller: "REVOKED" });
    expect((await officer.api.post(`/api/sellers/${seller.id}/status`, { data: { action: "REINSTATE", reason: "Settled with the poster." } })).ok()).toBeTruthy();
    expect((await seller.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).ok()).toBeTruthy();
    await db.$disconnect();
  });
});

test.describe("items 6 and 11: verification through the UI", () => {
  test("a student sends proof, a USED officer approves it, and the badge appears", async ({ page, browser }) => {
    const student = await newUser("Verifier", { verified: false });
    await signInPage(page, { email: student.email, password: "password123" });
    await page.goto("/verify");
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page.getByText("Enter the ID number")).toBeVisible();
    await page.getByLabel("Student ID number").fill("2022-01234");
    await page.getByLabel("Proof").setInputFiles(proofFile());
    await page.getByRole("checkbox").check();
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}/phase5-verify-form.png`, fullPage: true });
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(page.getByText("Waiting for review")).toBeVisible();

    const officer = await usedOfficer();
    const ctx = await browser.newContext({ ...test.info().project.use, baseURL: BASE });
    const o = waitForHydration(await ctx.newPage());
    await signInPage(o, { email: officer.email, password: "password123" }, "ADMIN");
    await o.goto("/used/verifications");
    const row = o.getByRole("listitem").filter({ hasText: "Verifier Tester" });
    await expect(row).toContainText("2022-01234");
    await o.screenshot({ path: `test-results/screens/${test.info().project.name}/phase5-used-queue.png`, fullPage: true });
    await row.getByRole("button", { name: /Approve/ }).click();
    await expect(row).toHaveCount(0);
    await o.goto("/admin");
    await expect(o).not.toHaveURL(/\/admin$/);
    await ctx.close();

    await page.reload();
    await expect(page.getByText("You're verified")).toBeVisible();
    await page.goto("/profile");
    await expect(page.getByText("CCIS verified")).toBeVisible();
  });
});

test.describe("item 1: transaction history", () => {
  test("each user sees only their own; admins see everyone's, with filters", async ({ page, browser }) => {
    const { poster, worker, c } = await hiredCommission();
    expect((await poster.api.post(`/api/commissions/${c.id}/complete`, { data: { stars: 5, comment: "Great poster, on time." } })).ok()).toBeTruthy();

    await signInPage(page, { email: worker.email, password: "password123" });
    await page.goto("/transactions");
    const row = page.getByRole("row").filter({ hasText: c.title });
    await expect(row).toContainText(poster.name);
    await expect(row).toContainText("hired you");
    await expect(row).toContainText("₱500–800");
    await expect(row).toContainText("Completed");
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}/phase5-transactions.png`, fullPage: true });

    const stranger = await newUser("Outsider");
    const s = await browser.newContext({ ...test.info().project.use, baseURL: BASE });
    const sp = waitForHydration(await s.newPage());
    await signInPage(sp, { email: stranger.email, password: "password123" });
    await sp.goto("/transactions");
    await expect(sp.getByText("No transactions yet")).toBeVisible();
    await expect(sp.getByText(c.title)).toHaveCount(0);
    await sp.goto("/admin/transactions");
    await expect(sp).not.toHaveURL(/\/admin\/transactions/);
    await s.close();

    const a = await browser.newContext({ ...test.info().project.use, baseURL: BASE });
    const ap = waitForHydration(await a.newPage());
    await signInPage(ap, ADMIN, "ADMIN");
    await ap.goto(`/admin/transactions?q=${encodeURIComponent(worker.email)}`);
    await expect(ap.getByRole("row").filter({ hasText: c.title })).toContainText(`${poster.name} → ${worker.name}`);
    await ap.goto(`/admin/transactions?q=${encodeURIComponent(worker.email)}&status=CANCELLED`);
    await expect(ap.getByText(c.title)).toHaveCount(0);
    await ap.goto(`/admin/transactions?q=${encodeURIComponent(worker.email)}&from=2000-01-01&to=2000-01-02`);
    await expect(ap.getByText(c.title)).toHaveCount(0);
    await a.close();
  });
});

test.describe("item 4: available or busy", () => {
  test("a profile shows Busy while someone has unfinished work and Available once it's done", async ({ page }) => {
    const { poster, worker, c } = await hiredCommission();
    const viewer = await newUser("Viewer");
    await signInPage(page, { email: viewer.email, password: "password123" });
    await page.goto(`/u/${worker.id}`);
    await expect(page.getByText("Busy · 1 job")).toBeVisible();
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}/phase5-busy.png`, fullPage: true });

    expect((await poster.api.post(`/api/commissions/${c.id}/complete`, { data: { stars: 5, comment: "Delivered early, thank you." } })).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByText("Available", { exact: true })).toBeVisible();
  });
});
