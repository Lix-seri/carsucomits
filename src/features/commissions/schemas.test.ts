import { test } from "node:test";
import assert from "node:assert/strict";
import { createCommissionSchema, listCommissionsSchema } from "./schemas";

const valid = {
  title: "Design a poster",
  description: "A3 poster with two revisions included.",
  category: "TECHNICAL",
  requiredLevel: "BEGINNER",
  fareMin: 500,
};
const error = (input: object) => createCommissionSchema.safeParse(input).error?.issues[0];

test("a valid commission parses, with empty optionals normalised to null", () => {
  const out = createCommissionSchema.parse({ ...valid, subcategory: "", fareMax: null });
  assert.equal(out.subcategory, null);
  assert.equal(out.fareMax, null);
});

test("a non-numeric fare is a 400 with a message, not a 500", () => {
  assert.match(error({ ...valid, fareMin: "abc" })!.message, /must be a number/);
});

test("a missing fare says it is required", () => {
  const { fareMin, ...rest } = valid;
  void fareMin;
  assert.equal(error(rest)!.message, "Minimum fare is required.");
  assert.equal(error({ ...valid, fareMin: "" })!.message, "Minimum fare is required.");
});

test("max fare below min fare is rejected on the fareMax field", () => {
  const issue = error({ ...valid, fareMax: 100 })!;
  assert.deepEqual(issue.path, ["fareMax"]);
});

test("a deadline in the past is rejected", () => {
  assert.deepEqual(error({ ...valid, deadline: "2000-01-01" })!.path, ["deadline"]);
});

test("unknown category and oversized title are rejected", () => {
  assert.ok(error({ ...valid, category: "THESIS" }));
  assert.ok(error({ ...valid, title: "x".repeat(121) }));
});

test("browse filters ignore garbage instead of failing", () => {
  const f = listCommissionsSchema.parse({ category: "nope", status: "nope" });
  assert.equal(f.category, undefined);
  assert.equal(f.status, "OPEN");
});
