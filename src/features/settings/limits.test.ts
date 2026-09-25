import { test } from "node:test";
import assert from "node:assert/strict";
import { applyBlockedReason } from "./limits";

const limits = { MAX_PENDING_APPLICATIONS: 3, MAX_ACTIVE_JOBS: 1 };

test("applying is allowed under both limits", () => {
  assert.equal(applyBlockedReason({ pending: 2, active: 0 }, limits), null);
});

test("the job limit is checked first and names the count", () => {
  assert.match(applyBlockedReason({ pending: 3, active: 1 }, limits) ?? "", /working on 1 commission,/);
});

test("the pending limit blocks at the limit, not above it", () => {
  assert.match(applyBlockedReason({ pending: 3, active: 0 }, limits) ?? "", /3 applications waiting/);
});
