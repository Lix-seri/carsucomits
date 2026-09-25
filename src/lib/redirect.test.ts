import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "./redirect";

test("same-site paths are kept", () => {
  assert.equal(safeNextPath("/hub"), "/hub");
  assert.equal(safeNextPath("/messages?with=abc"), "/messages?with=abc");
});

test("anything that could leave the site is dropped", () => {
  for (const v of ["//evil.com", "/\\evil.com", "https://evil.com", "evil.com", "", null, undefined]) {
    assert.equal(safeNextPath(v), null, String(v));
  }
});
