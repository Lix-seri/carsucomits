import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { setSession, type Session } from "@/lib/session";
import type { z } from "zod";
import { consumeBackupCode, generateBackupCodes, newSecret, totpUri, verifyTotp } from "./mfa";
import type { loginSchema, registerSchema } from "./schemas";

/** Emails are stored as typed by older accounts, so match without regard to case. */
function findByEmail(email: string) {
  return prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
}

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Failed sign-ins (wrong password or wrong MFA code) for this account since the later
 * of the lockout window's start and its last successful sign-in. Stored in the audit
 * log, so the limit holds across serverless instances.
 */
async function recentFailures(userId: string) {
  const lastLogin = await prisma.auditLog.findFirst({
    where: { action: "LOGIN", target: userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const windowStart = new Date(Date.now() - LOCKOUT_MINUTES * 60_000);
  const since = lastLogin && lastLogin.createdAt > windowStart ? lastLogin.createdAt : windowStart;
  return prisma.auditLog.count({ where: { action: "LOGIN_FAILED", target: userId, createdAt: { gt: since } } });
}

async function failLogin(userId: string, message: string): Promise<never> {
  await prisma.auditLog.create({ data: { actorId: userId, action: "LOGIN_FAILED", target: userId } });
  throw new HttpError(401, message);
}

/** Verifies credentials (and MFA when enabled), then sets the session cookie. */
export async function login({ email, password, expectedRole, mfaCode }: z.infer<typeof loginSchema>) {
  const user = await findByEmail(email);
  if (!user) throw new HttpError(401, "Invalid credentials.");
  if ((await recentFailures(user.id)) >= LOCKOUT_ATTEMPTS) {
    throw new HttpError(429, `Too many failed sign-in attempts. Try again in ${LOCKOUT_MINUTES} minutes.`);
  }
  if (!(await bcrypt.compare(password, user.passwordHash))) await failLogin(user.id, "Invalid credentials.");
  // Status only after the password, so strangers can't probe whether an account is banned.
  if (user.status === "BANNED") throw new HttpError(403, "This account is banned.");
  if (user.status === "SUSPENDED") throw new HttpError(403, "This account is suspended.");

  // Enforce the role chosen on the login screen.
  if (expectedRole === "ADMIN" && user.role !== "ADMIN") {
    throw new HttpError(403, "This is not an admin account. Switch to the Student tab to sign in.");
  }
  if (expectedRole === "STUDENT" && user.role === "ADMIN") {
    throw new HttpError(403, "This is an admin account. Switch to the Admin tab to sign in.");
  }

  if (user.mfaEnabled) {
    if (!mfaCode) return { mfaRequired: true as const };
    const code = mfaCode;
    let codeOk = !!user.totpSecret && verifyTotp(user.totpSecret, code);
    if (!codeOk) {
      const result = consumeBackupCode(user.mfaBackupCodes, code);
      if (result.ok) {
        await prisma.user.update({ where: { id: user.id }, data: { mfaBackupCodes: result.remaining } });
        codeOk = true;
      }
    }
    if (!codeOk) await failLogin(user.id, "Invalid 6-digit code or backup code.");
  }

  await setSession(user);
  await prisma.auditLog.create({ data: { actorId: user.id, action: "LOGIN", target: user.id } });
  return { user: { id: user.id, fullName: user.fullName, role: user.role } };
}

/** Self-registration always creates a STUDENT_EMPLOYEE; it can never create an admin. */
export async function register({ fullName, email, password }: z.infer<typeof registerSchema>) {
  if (await findByEmail(email)) throw new HttpError(409, "An account with this email already exists.");
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash: await bcrypt.hash(password, 10), role: "STUDENT_EMPLOYEE", emailVerified: true },
  });
  await setSession(user);
  return { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } };
}

/**
 * Generates a fresh TOTP secret + QR code; MFA stays off until confirmed with enableMfa.
 * Refused while MFA is on: replacing the secret would switch MFA off without the
 * password check that disableMfa requires.
 */
export async function startMfaSetup(session: Session) {
  const current = await prisma.user.findUnique({ where: { id: session.userId }, select: { mfaEnabled: true } });
  if (current?.mfaEnabled) {
    throw new HttpError(409, "Two-factor authentication is already on. Turn it off first; that needs your password.");
  }
  const secret = newSecret();
  const uri = totpUri(secret, session.email);
  const qrDataUrl = await QRCode.toDataURL(uri);
  await prisma.user.update({ where: { id: session.userId }, data: { totpSecret: secret, mfaEnabled: false } });
  return { secret, qrDataUrl, uri };
}

/** Confirms the authenticator works, turns MFA on and returns one-time backup codes. */
export async function enableMfa(session: Session, code: string) {
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.totpSecret) throw new HttpError(400, "Start MFA setup first.");
  if (!verifyTotp(user.totpSecret, code)) throw new HttpError(400, "Invalid code. Try again.");

  const backupCodes = generateBackupCodes(6);
  await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: true, mfaBackupCodes: JSON.stringify(backupCodes) } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "MFA_ENABLED", target: user.id } });
  return { backupCodes };
}

/** Re-verifies the password, then turns MFA off. */
export async function disableMfa(session: Session, password: string) {
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new HttpError(404, "Not found.");
  if (!(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, "Incorrect password.");

  await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: false, totpSecret: null, mfaBackupCodes: null } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "MFA_DISABLED", target: user.id } });
  return {};
}
