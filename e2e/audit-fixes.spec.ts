import { test, expect } from "@playwright/test";
import { hiredCommission, testDb } from "./helpers";

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
