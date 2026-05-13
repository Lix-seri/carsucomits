// Email service — uses Resend if RESEND_API_KEY is set, otherwise logs the
// would-be email to the server console (useful for local dev without a Resend account).

import { Resend } from "resend";

const APP_NAME = "CarsuComits";
const FROM = process.env.EMAIL_FROM ?? "CarsuComits <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function send({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const c = client();
  if (!c) {
    console.log("📧 [email stub — no RESEND_API_KEY set]");
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Text:    ${text}`);
    return { ok: true, stubbed: true };
  }
  const { error } = await c.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error("Resend send error:", error);
    return { ok: false, stubbed: false, error };
  }
  return { ok: true, stubbed: false };
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  return send({
    to,
    subject: `Verify your ${APP_NAME} account`,
    text: `Welcome to ${APP_NAME}! Click here to verify your CSU email: ${link}\n\nThis link expires in 24 hours.`,
    html: emailShell(
      "Verify your CarsuComits account",
      `<p>Welcome to <strong>${APP_NAME}</strong>!</p>
       <p>Click the button below to verify your CSU email address. This link expires in 24 hours.</p>
       <p><a href="${link}" class="btn">Verify my email</a></p>
       <p class="muted">If the button doesn't work, paste this into your browser:<br><a href="${link}">${link}</a></p>`,
    ),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return send({
    to,
    subject: `Reset your ${APP_NAME} password`,
    text: `Reset your password by visiting: ${link}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: emailShell(
      "Reset your CarsuComits password",
      `<p>You requested a password reset. Click below to choose a new password.</p>
       <p><a href="${link}" class="btn">Reset my password</a></p>
       <p class="muted">If you didn't request this, ignore this email. The link expires in 1 hour.</p>
       <p class="muted">Or paste this URL into your browser:<br><a href="${link}">${link}</a></p>`,
    ),
  });
}

function emailShell(title: string, body: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f7f5;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0F172A">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
      <tr><td style="background:#16A34A;padding:24px;color:#fff">
        <h1 style="margin:0;font-size:20px">${APP_NAME}</h1>
        <p style="margin:4px 0 0;opacity:.85;font-size:13px">CSU Commission Marketplace</p>
      </td></tr>
      <tr><td style="padding:28px">
        <h2 style="margin-top:0;font-size:18px">${title}</h2>
        ${body}
        <p class="muted" style="color:#64748B;font-size:12px;margin-top:32px">Caraga State University &middot; Ampayon, Butuan City</p>
      </td></tr>
    </table>
  </td></tr></table>
  <style>
    .btn{display:inline-block;background:#16A34A;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;margin:12px 0}
    .muted{color:#64748B;font-size:12px}
    a{color:#16A34A}
  </style>
</body></html>`;
}

export function makeToken(bytes = 32) {
  // crypto.randomUUID is available in Node 18+ and Edge runtime.
  // 32 random bytes hex-encoded is plenty.
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
