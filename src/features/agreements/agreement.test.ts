import { test } from "node:test";
import assert from "node:assert/strict";
import { AGREEMENT_VERSION, bothAccepted, snapshotTerms } from "./agreement";

const parties = { commissionerId: "poster", awardedToId: "worker" };

test("work starts only when both parties accepted the current version", () => {
  assert.equal(bothAccepted([{ userId: "poster", version: AGREEMENT_VERSION }], parties), false);
  assert.equal(bothAccepted([{ userId: "poster", version: AGREEMENT_VERSION }, { userId: "worker", version: "old" }], parties), false);
  assert.equal(bothAccepted([{ userId: "poster", version: AGREEMENT_VERSION }, { userId: "worker", version: AGREEMENT_VERSION }], parties), true);
  assert.equal(bothAccepted([{ userId: "poster", version: AGREEMENT_VERSION }], { commissionerId: "poster", awardedToId: null }), false);
});

test("the snapshot records scope, price and deadline", () => {
  const t = snapshotTerms({ title: "Poster", description: "A3 poster", fareMin: 500, fareMax: 800, fareUnit: null, deadline: new Date("2026-10-01T00:00:00Z") });
  assert.deepEqual(t, { title: "Poster", scope: "A3 poster", fare: "₱500–800", deadline: "2026-10-01" });
});
