import { test } from "node:test";
import assert from "node:assert/strict";
import { signToken, verifyToken } from "./session";

// Read lazily by session.ts at call time, so setting it here is enough.
process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";

const future = () => Math.floor(Date.now() / 1000) + 60;

test("a signed token round-trips", async () => {
  const t = await signToken({ uid: "u1", role: "STUDENT_EMPLOYEE", exp: future() });
  assert.equal((await verifyToken(t))?.uid, "u1");
});

test("editing the payload (e.g. role → ADMIN) breaks the signature", async () => {
  const t = await signToken({ uid: "u1", role: "STUDENT_EMPLOYEE", exp: future() });
  const [, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ uid: "u1", role: "ADMIN", exp: future() })).toString("base64url");
  assert.equal(await verifyToken(`${forged}.${sig}`), null);
});

test("the old unsigned base64 cookie format is rejected", async () => {
  const legacy = Buffer.from(JSON.stringify({ userId: "u1", role: "ADMIN" })).toString("base64");
  assert.equal(await verifyToken(legacy), null);
});

test("expired tokens are rejected", async () => {
  const t = await signToken({ uid: "u1", role: "ADMIN", exp: Math.floor(Date.now() / 1000) - 1 });
  assert.equal(await verifyToken(t), null);
});

test("a token signed with a different secret is rejected", async () => {
  const t = await signToken({ uid: "u1", role: "ADMIN", exp: future() });
  process.env.AUTH_SECRET = "another-secret-that-is-at-least-32-characters";
  try {
    assert.equal(await verifyToken(t), null);
  } finally {
    process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  }
});

test("garbage and empty values are rejected", async () => {
  for (const v of [undefined, "", ".", "a.b.c", "not-a-token"]) assert.equal(await verifyToken(v), null);
});
