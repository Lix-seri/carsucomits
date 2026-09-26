// TOTP (Time-based One-Time Password) helpers used for admin MFA.
// Uses the `otpauth` library which is pure JS and works on Vercel's edge/serverless.

import { Secret, TOTP } from "otpauth";

const ISSUER = "CarSUComits";

export function newSecret() {
  return new Secret({ size: 20 }).base32;
}

export function buildTotp(secret: string, account: string) {
  return new TOTP({
    issuer: ISSUER,
    label: account,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
}

export function totpUri(secret: string, account: string) {
  return buildTotp(secret, account).toString();
}

export function verifyTotp(secret: string, code: string) {
  if (!code || !/^\d{6}$/.test(code.trim())) return false;
  const totp = buildTotp(secret, "verify");
  // window: ±1 step to allow for clock skew
  const delta = totp.validate({ token: code.trim(), window: 1 });
  return delta !== null;
}

export function generateBackupCodes(count = 6): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const arr = new Uint8Array(5);
    crypto.getRandomValues(arr);
    const hex = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    codes.push(`${hex.slice(0, 5)}-${hex.slice(5, 10)}`);
  }
  return codes;
}

export function consumeBackupCode(stored: string | null, attempted: string): { ok: boolean; remaining: string } {
  if (!stored) return { ok: false, remaining: "" };
  let arr: string[] = [];
  try { arr = JSON.parse(stored); } catch { return { ok: false, remaining: stored }; }
  const idx = arr.findIndex((c) => c.toLowerCase() === attempted.trim().toLowerCase());
  if (idx === -1) return { ok: false, remaining: stored };
  arr.splice(idx, 1);
  return { ok: true, remaining: JSON.stringify(arr) };
}
