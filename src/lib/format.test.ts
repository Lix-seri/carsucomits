import { test } from "node:test";
import assert from "node:assert/strict";
import { formatFare, greeting } from "./format";

test("greeting uses Manila time, not the server's UTC clock", () => {
  assert.equal(greeting(new Date("2026-09-25T23:30:00Z")), "Good morning"); // 07:30 in Manila
  assert.equal(greeting(new Date("2026-09-26T05:00:00Z")), "Good afternoon"); // 13:00
  assert.equal(greeting(new Date("2026-09-26T11:00:00Z")), "Good evening"); // 19:00
});

test("fares show a range only when there is a max", () => {
  assert.equal(formatFare({ fareMin: 500, fareMax: null, fareUnit: null }), "₱500");
  assert.equal(formatFare({ fareMin: 500, fareMax: 800, fareUnit: "/hr" }), "₱500–800/hr");
});

test("deadlines read as a human countdown in Manila days", async () => {
  const { dueLabel } = await import("./format");
  const now = new Date("2026-09-26T10:00:00+08:00");
  assert.equal(dueLabel(null, now), "No deadline");
  assert.equal(dueLabel("2026-09-26T23:00:00+08:00", now), "Due today");
  assert.equal(dueLabel("2026-09-27", now), "Due tomorrow");
  assert.equal(dueLabel("2026-09-29", now), "Due in 3 days");
  assert.equal(dueLabel("2026-10-17", now), "Due in 3 weeks");
  assert.equal(dueLabel("2026-09-24", now), "2 days overdue");
  assert.equal(dueLabel("2026-09-25", now), "1 day overdue");
});
