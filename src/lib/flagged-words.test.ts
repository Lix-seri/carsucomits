import { test } from "node:test";
import assert from "node:assert/strict";
import { findFlaggedTerms, normalize } from "./flagged-words";

const terms = [{ term: "thesis" }, { term: "research paper" }, { term: "scam" }];
const hits = (text: string) => findFlaggedTerms(text, terms).map((t) => t.term);

test("normalization undoes case, accents, spacing, look-alikes and stretched letters", () => {
  assert.equal(normalize("T h E s I s"), "thesis");
  assert.equal(normalize("th3$1s"), "thesis");
  assert.equal(normalize("THESSSIS"), "thesis");
  assert.equal(normalize("thésis"), "thesis");
});

test("evasions of a flagged term still match", () => {
  for (const text of ["Write my THESIS", "t.h.e.s.i.s help", "th3s1s", "thessis chapter 2", "r3search-paper due friday", "not a $cam"]) {
    assert.ok(hits(text).length > 0, text);
  }
});

test("clean text doesn't match, and every matching term is reported", () => {
  assert.deepEqual(hits("Design a poster for our org fair"), []);
  assert.deepEqual(hits("thesis and research paper, no scam").sort(), ["research paper", "scam", "thesis"]);
});

test("terms that normalize to under 3 letters never match everything", () => {
  assert.deepEqual(findFlaggedTerms("anything", [{ term: "  !! " }]), []);
});
