import { test } from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema } from "./schemas";

test("emails are trimmed and lower-cased", () => {
  assert.equal(loginSchema.parse({ email: "  Glen.Licayan@CARSU.edu.ph ", password: "x" }).email, "glen.licayan@carsu.edu.ph");
});

test("registration requires the CSU domain and an 8+ character password", () => {
  const base = { fullName: "Test User", email: "t@carsu.edu.ph", password: "password123" };
  assert.ok(registerSchema.safeParse(base).success);
  assert.equal(registerSchema.safeParse({ ...base, email: "t@gmail.com" }).success, false);
  assert.equal(registerSchema.safeParse({ ...base, password: "short" }).success, false);
});

test("registration ignores a requested role", () => {
  assert.equal("role" in registerSchema.parse({ fullName: "Test User", email: "t@carsu.edu.ph", password: "password123", role: "ADMIN" }), false);
});
