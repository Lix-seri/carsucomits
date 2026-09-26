import { test } from "node:test";
import assert from "node:assert/strict";
import { transactionFilterSchema } from "./schemas";

test("transaction filters accept dates and blanks, and reject junk", () => {
  const ok = transactionFilterSchema.parse({ from: "2026-09-01", to: "", status: "", q: " ana " });
  assert.deepEqual(ok, { from: "2026-09-01", to: undefined, status: undefined, q: "ana" });
  assert.equal(transactionFilterSchema.safeParse({ from: "yesterday" }).success, false);
  assert.equal(transactionFilterSchema.safeParse({ status: "PAID" }).success, false);
});
