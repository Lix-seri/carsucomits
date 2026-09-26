import { test, expect, waitForHydration } from "./fixtures";
import { ADMIN, BASE, adminApi, newUser, postCommission, signInPage, testDb } from "./helpers";

// Phase 5 items 5 and 9: flagged words, the review queue, and the academic-work ban
// (claude/decisions/0011). API rules run once (desktop); the UI flows run on both.

test.describe("items 5 and 9: flagged words (API)", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("a post asking for a thesis is held, queued as academic dishonesty, logged, and published only after approval", async () => {
    const poster = await newUser("Holder");
    const stranger = await newUser("Passerby");
    const c = await postCommission(poster.api, { title: `Write my th3 sis chapter ${Date.now()}`, description: "Chapter 1 to 3, due next week, I pay well." });

    const db = testDb();
    expect((await db.commission.findUniqueOrThrow({ where: { id: c.id } })).heldForReview).toBe(true);
    const flag = await db.flaggedContent.findFirstOrThrow({ where: { refId: c.id } });
    expect(flag.category).toBe("ACADEMIC_DISHONESTY");
    expect(flag.terms).toContain("thesis");
    expect(await db.auditLog.count({ where: { action: "CONTENT_FLAGGED", target: c.id } })).toBe(1);

    // Hidden from Browse and from anyone but the poster.
    const list = await (await stranger.api.get(`/api/commissions?q=${encodeURIComponent(c.title)}`)).json();
    expect(list.commissions.map((x: { id: string }) => x.id)).not.toContain(c.id);
    expect((await stranger.api.get(`/commission/${c.id}`)).status()).toBe(404);
    expect((await poster.api.get(`/commission/${c.id}`)).status()).toBe(200);

    expect((await stranger.api.post(`/api/admin/flags/${flag.id}/decision`, { data: { decision: "APPROVE" } })).status()).toBe(403);
    const admin = await adminApi();
    expect((await admin.post(`/api/admin/flags/${flag.id}/decision`, { data: { decision: "APPROVE" } })).ok()).toBeTruthy();
    expect((await stranger.api.get(`/commission/${c.id}`)).status()).toBe(200);
    const approved = await db.auditLog.findFirstOrThrow({ where: { action: "CONTENT_APPROVED", target: c.id } });
    expect(approved.after).toEqual({ status: "APPROVED" });
    await db.$disconnect();
  });

  test("a flagged message is saved but not delivered; admins manage the word list", async () => {
    const sender = await newUser("Sender");
    const recipient = await newUser("Recipient");
    const admin = await adminApi();

    const short = await admin.post("/api/admin/words", { data: { term: "!!", category: "GENERAL" } });
    expect(short.status()).toBe(400);
    expect((await sender.api.post("/api/admin/words", { data: { term: "bogus deal", category: "GENERAL" } })).status()).toBe(403);
    const added = await admin.post("/api/admin/words", { data: { term: "bogus deal", category: "GENERAL" } });
    expect(added.ok(), await added.text()).toBeTruthy();
    const { word } = await added.json();

    const sent = await sender.api.post("/api/messages", { data: { recipientId: recipient.id, body: "Here's a B0GUS   d3al for you" } });
    expect((await sent.json()).held).toBe(true);
    const theirs = await (await recipient.api.get(`/api/messages/${sender.id}`)).json();
    expect(theirs.messages).toHaveLength(0);
    const mine = await (await sender.api.get(`/api/messages/${recipient.id}`)).json();
    expect(mine.messages).toHaveLength(1);

    expect((await admin.delete(`/api/admin/words/${word.id}`)).ok()).toBeTruthy();
    const db = testDb();
    expect(await db.auditLog.count({ where: { action: { in: ["WORD_ADDED", "WORD_REMOVED"] }, target: "bogus deal" } })).toBe(2);
    await db.$disconnect();
  });

  test("anyone can report a commission for academic dishonesty; the poster is the reportee", async () => {
    const poster = await newUser("Reported");
    const reader = await newUser("Reader");
    const c = await postCommission(poster.api);
    const res = await reader.api.post(`/api/commissions/${c.id}/report`, { data: { reason: "Academic dishonesty (thesis or graded work)", details: "They asked me privately to write their lab report." } });
    expect(res.ok(), await res.text()).toBeTruthy();
    const { report } = await res.json();
    expect(report.reporteeId).toBe(poster.id);
    expect(report.commissionId).toBe(c.id);
    expect((await poster.api.post(`/api/commissions/${c.id}/report`, { data: { reason: "Other", details: "Reporting my own post." } })).status()).toBe(400);
  });
});

test.describe("items 5 and 9: flagged words (UI)", () => {
  test("the poster sees Under review; an admin approves it from the queue; a student reports another post", async ({ page, browser }) => {
    const poster = await newUser("UiHolder");
    const title = `Capstone documentation help ${Date.now()}`;
    await signInPage(page, { email: poster.email, password: "password123" });
    await page.goto("/hiring/post");
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Category", { exact: true }).selectOption("TECHNICAL");
    await page.getByLabel("Description").fill("Format and finish our capstone manuscript before the defense.");
    await page.getByLabel("Fare (min) ₱").fill("800");
    await page.getByRole("button", { name: "Post Commission" }).click();
    await expect(page.getByText("Under review.")).toBeVisible();
    await page.screenshot({ path: `test-results/screens/${test.info().project.name}/phase5-held-post.png`, fullPage: true });

    const ctx = await browser.newContext({ ...test.info().project.use, baseURL: BASE });
    const a = waitForHydration(await ctx.newPage());
    await signInPage(a, ADMIN, "ADMIN");
    await a.goto("/admin/moderation");
    const item = a.getByRole("listitem").filter({ hasText: title });
    await expect(item).toContainText("Academic dishonesty");
    await a.screenshot({ path: `test-results/screens/${test.info().project.name}/phase5-review-queue.png`, fullPage: true });
    await item.getByRole("button", { name: "Approve" }).click();
    await expect(item).toHaveCount(0);
    await ctx.close();

    const other = await newUser("UiPoster");
    const c = await postCommission(other.api);
    await page.goto(`/commission/${c.id}`);
    await page.getByRole("button", { name: "Report this commission" }).click();
    const dialog = page.getByRole("dialog", { name: "Report this commission" });
    await dialog.getByRole("button", { name: "Send report" }).click();
    await expect(dialog.getByText("Choose a reason.")).toBeVisible();
    await dialog.getByLabel("Reason").selectOption("Academic dishonesty (thesis or graded work)");
    await dialog.getByLabel("What's wrong?").fill("The description asks for our graded lab report.");
    await dialog.getByRole("button", { name: "Send report" }).click();
    await expect(page.getByText("Reported. Admins will review it.")).toBeVisible();
  });
});
