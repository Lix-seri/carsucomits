import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { setSession, type Session } from "@/lib/session";
import { consumeBackupCode, generateBackupCodes, newSecret, totpUri, verifyTotp } from "./mfa";

type LoginInput = { email?: unknown; password?: unknown; expectedRole?: unknown; mfaCode?: unknown };

/** Verifies credentials (and MFA when enabled), then sets the session cookie. */
export async function login(input: LoginInput) {
  const { email, password, expectedRole, mfaCode } = input;
  if (typeof email !== "string" || !email || typeof password !== "string" || !password) {
    throw new HttpError(400, "Email and password are required.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(401, "Invalid credentials.");
  if (user.status === "BANNED") throw new HttpError(403, "This account is banned.");
  if (user.status === "SUSPENDED") throw new HttpError(403, "This account is suspended.");
  if (!(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, "Invalid credentials.");

  // Enforce the role chosen on the login screen.
  if (expectedRole === "ADMIN" && user.role !== "ADMIN") {
    throw new HttpError(403, "This is not an admin account. Switch to the Student tab to sign in.");
  }
  if (expectedRole === "STUDENT" && user.role === "ADMIN") {
    throw new HttpError(403, "This is an admin account. Switch to the Admin tab to sign in.");
  }

  if (user.mfaEnabled) {
    if (!mfaCode) return { mfaRequired: true as const };
    const code = String(mfaCode).trim();
    let codeOk = !!user.totpSecret && verifyTotp(user.totpSecret, code);
    if (!codeOk) {
      const result = consumeBackupCode(user.mfaBackupCodes, code);
      if (result.ok) {
        await prisma.user.update({ where: { id: user.id }, data: { mfaBackupCodes: result.remaining } });
        codeOk = true;
      }
    }
    if (!codeOk) throw new HttpError(401, "Invalid 6-digit code or backup code.");
  }

  await setSession(user);
  await prisma.auditLog.create({ data: { actorId: user.id, action: "LOGIN", target: user.id } });
  return { user: { id: user.id, fullName: user.fullName, role: user.role } };
}

type RegisterInput = { fullName?: unknown; email?: unknown; password?: unknown; role?: unknown };

export async function register(input: RegisterInput) {
  const { fullName, email, password, role } = input;
  if (typeof fullName !== "string" || !fullName || typeof email !== "string" || !email || typeof password !== "string" || !password) {
    throw new HttpError(400, "All fields are required.");
  }
  if (!email.endsWith("@carsu.edu.ph")) throw new HttpError(400, "Use your @carsu.edu.ph email.");
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, "An account with this email already exists.");
  }

  // Self-registration cannot create admins.
  const safeRole = role === "COMMISSIONER" ? "COMMISSIONER" : "STUDENT_EMPLOYEE";
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash: await bcrypt.hash(password, 10), role: safeRole, emailVerified: true },
  });
  await setSession(user);
  return { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } };
}

/** Generates a fresh TOTP secret + QR code. MFA stays off until confirmed with enableMfa. */
export async function startMfaSetup(session: Session) {
  const secret = newSecret();
  const uri = totpUri(secret, session.email);
  const qrDataUrl = await QRCode.toDataURL(uri);
  await prisma.user.update({ where: { id: session.userId }, data: { totpSecret: secret, mfaEnabled: false } });
  return { secret, qrDataUrl, uri };
}

/** Confirms the authenticator works, turns MFA on and returns one-time backup codes. */
export async function enableMfa(session: Session, code: unknown) {
  if (!code) throw new HttpError(400, "Code required.");
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.totpSecret) throw new HttpError(400, "Start MFA setup first.");
  if (!verifyTotp(user.totpSecret, String(code))) throw new HttpError(400, "Invalid code. Try again.");

  const backupCodes = generateBackupCodes(6);
  await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: true, mfaBackupCodes: JSON.stringify(backupCodes) } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "MFA_ENABLED", target: user.id } });
  return { backupCodes };
}

/** Re-verifies the password, then turns MFA off. */
export async function disableMfa(session: Session, password: unknown) {
  if (typeof password !== "string" || !password) throw new HttpError(400, "Password required.");
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new HttpError(404, "Not found.");
  if (!(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, "Incorrect password.");

  await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: false, totpSecret: null, mfaBackupCodes: null } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "MFA_DISABLED", target: user.id } });
  return {};
}
