import { test } from "node:test";
import assert from "node:assert/strict";
import { trustTier } from "./trust";

test("trust tiers follow rating and review volume", () => {
  assert.equal(trustTier(null, 0).level, "NEW");
  assert.equal(trustTier(2.5, 2).level, "CAUTION");
  assert.equal(trustTier(2.5, 1).level, "RISING"); // one bad review isn't a pattern
  assert.equal(trustTier(4.6, 5).level, "HIGHLY_TRUSTED");
  assert.equal(trustTier(4.6, 4).level, "TRUSTED");
  assert.equal(trustTier(3.9, 10).level, "RISING");
  assert.equal(trustTier(4.2, 1).description, "4.2 stars over 1 review, still building a reputation.");
});
