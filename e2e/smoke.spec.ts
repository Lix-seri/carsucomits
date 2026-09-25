import { test, expect } from "@playwright/test";
import { ADMIN, adminApi, newUser, postCommission, signInPage, visit } from "./helpers";

// End-to-end API flow: post → apply → accept → complete + rate → rate back,
// plus messaging, bookmarks, reports and moderation. Runs once (desktop project).
test.describe("marketplace flow over the API", () => {
  test.skip(({ isMobile }) => isMobile, "API flow runs once");

  test("post, apply, hire, complete, rate, message, report, moderate", async () => {
    const poster = await newUser("Poster");
    const worker = await newUser("Worker");
    const other = await newUser("Other");
    const admin = await adminApi();

    const c = await postCommission(poster.api);

    // Listed on browse.
    const open = await (await worker.api.get(`/api/commissions?status=OPEN`)).json();
    expect(open.commissions.some((x: { id: string }) => x.id === c.id)).toBeTruthy();

    // Apply from two users; a duplicate is refused; one withdraws; can't apply to your own.
    const applied = await worker.api.post(`/api/commissions/${c.id}/apply`, { data: { coverLetter: "I do posters." } });
    expect(applied.ok()).toBeTruthy();
    const appId = (await applied.json()).application.id as string;
    expect((await worker.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).status()).toBe(409);
    const otherApp = await (await other.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).json();
    expect((await other.api.post(`/api/applications/${otherApp.application.id}/withdraw`)).ok()).toBeTruthy();
    expect((await poster.api.post(`/api/commissions/${c.id}/apply`, { data: {} })).status()).toBe(400);

    // Only the poster can accept.
    expect((await worker.api.post(`/api/applications/${appId}/accept`)).status()).toBe(403);
    expect((await poster.api.post(`/api/applications/${appId}/accept`)).ok()).toBeTruthy();

    // Completion requires a rating; only the poster can complete.
    expect((await worker.api.post(`/api/commissions/${c.id}/complete`, { data: { stars: 5 } })).status()).toBe(403);
    expect((await poster.api.post(`/api/commissions/${c.id}/complete`, { data: {} })).status()).toBe(400);
    expect((await poster.api.post(`/api/commissions/${c.id}/complete`, { data: { stars: 5, comment: "Great work" } })).ok()).toBeTruthy();
    expect((await worker.api.post(`/api/ratings/commissioner`, { data: { commissionId: c.id, stars: 4 } })).ok()).toBeTruthy();

    // Messaging.
    expect((await poster.api.post(`/api/messages`, { data: { recipientId: worker.id, body: "Thanks!" } })).ok()).toBeTruthy();
    const threads = await (await worker.api.get(`/api/messages/threads`)).json();
    expect(threads.threads[0].unread).toBe(1);
    const convo = await (await worker.api.get(`/api/messages/${poster.id}`)).json();
    expect(convo.messages.map((m: { body: string }) => m.body)).toContain("Thanks!");

    // Notifications arrived for the worker.
    const notes = await (await worker.api.get(`/api/notifications`)).json();
    expect(notes.notifications.length).toBeGreaterThan(0);

    // Bookmark toggles.
    const c2 = await postCommission(poster.api, { title: "Second listing" });
    expect((await (await worker.api.post(`/api/saved/${c2.id}`)).json()).saved).toBe(true);
    expect((await (await worker.api.post(`/api/saved/${c2.id}`)).json()).saved).toBe(false);

    // Search finds users and commissions.
    const s = await (await worker.api.get(`/api/search?q=Second`)).json();
    expect(s.commissions.some((x: { id: string }) => x.id === c2.id)).toBeTruthy();

    // Report → admin resolves; admin warns then reinstates.
    const rep = await (await worker.api.post(`/api/reports`, { data: { reporteeEmail: other.email, reason: "Ghosting", details: "No reply for a week." } })).json();
    expect((await worker.api.post(`/api/admin/reports/${rep.report.id}/action`, { data: { action: "RESOLVE" } })).status()).toBe(403);
    expect((await admin.post(`/api/admin/reports/${rep.report.id}/action`, { data: { action: "RESOLVE" } })).ok()).toBeTruthy();
    expect((await admin.post(`/api/admin/users/${other.id}/action`, { data: { action: "WARN" } })).ok()).toBeTruthy();
    expect((await admin.post(`/api/admin/users/${other.id}/action`, { data: { action: "REINSTATE" } })).ok()).toBeTruthy();

    // Skills.
    const skill = await (await worker.api.post(`/api/skills`, { data: { name: "Illustrator", level: "ADVANCED" } })).json();
    expect((await poster.api.delete(`/api/skills/${skill.skill.id}`)).status()).toBe(404); // not theirs
    expect((await worker.api.delete(`/api/skills/${skill.skill.id}`)).ok()).toBeTruthy();
  });
});

// Every page, for every role, renders without errors on desktop and mobile. Screenshots land
// in test-results/screens/ for design review.
test.describe("every page renders", () => {
  test("visitor pages", async ({ page }, info) => {
    const poster = await newUser("Visible");
    const c = await postCommission(poster.api);
    for (const [path, name] of [
      ["/", "home"], ["/browse", "browse"], ["/about", "about"], ["/login", "login"], ["/register", "register"],
      [`/commission/${c.id}`, "commission"], [`/u/${poster.id}`, "public-profile"],
    ]) await visit(page, path, `${info.project.name}/visitor-${name}`);
  });

  test("signed-in user pages", async ({ page }, info) => {
    const me = await newUser("Pages");
    await signInPage(page, { email: me.email, password: "password123" });
    const c = await postCommission(me.api);
    for (const [path, name] of [
      ["/dashboard", "dashboard"], ["/hub", "hub"], ["/saved", "saved"], ["/profile", "profile"],
      ["/messages", "messages"], ["/reports", "reports"], ["/commissioner", "commissioner"],
      ["/commissioner/listings", "listings"], ["/commissioner/applicants", "applicants"],
      ["/commissioner/post", "post"], [`/commission/${c.id}`, "own-commission"],
    ]) await visit(page, path, `${info.project.name}/user-${name}`);
  });

  test("admin pages", async ({ page }, info) => {
    await signInPage(page, ADMIN, "ADMIN");
    for (const [path, name] of [
      ["/admin", "dashboard"], ["/admin/users", "users"], ["/admin/listings", "listings"],
      ["/admin/reports", "reports"], ["/admin/logs", "logs"], ["/admin/security", "security"], ["/admin/settings", "settings"],
    ]) await visit(page, path, `${info.project.name}/admin-${name}`);
  });
});
