import { test } from "node:test";
import assert from "node:assert/strict";
import { deliverableSchema } from "./schemas";

const file = (name: string, type: string) => new File(["x"], name, { type });
const ok = (f: File) => deliverableSchema.safeParse({ file: f }).success;

test("allowed extension with its MIME type is accepted", () => {
  assert.ok(ok(file("report.pdf", "application/pdf")));
  assert.ok(ok(file("photo.JPG", "image/jpeg")));
});

test("an empty MIME type no longer skips the check", () => {
  assert.equal(ok(file("page.html", "")), false);
  assert.equal(ok(file("report.pdf", "")), false);
});

test("a disguised file (allowed MIME, wrong extension) is rejected", () => {
  assert.equal(ok(file("run.exe", "application/pdf")), false);
});
