import { test } from "node:test";
import assert from "node:assert/strict";
import { ratingSchema } from "./schemas";

test("4–5 stars need no comment; 1–3 need 10+ characters", () => {
  assert.ok(ratingSchema.safeParse({ stars: 5 }).success);
  assert.equal(ratingSchema.safeParse({ stars: 3, comment: "meh" }).success, false);
  assert.ok(ratingSchema.safeParse({ stars: 2, comment: "Late by a week, no updates." }).success);
});

test("stars outside 1–5 or fractional are rejected", () => {
  for (const stars of [0, 6, 4.5, "x"]) assert.equal(ratingSchema.safeParse({ stars }).success, false);
});
