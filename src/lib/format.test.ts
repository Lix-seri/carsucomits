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
