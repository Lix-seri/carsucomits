// Signed cookie session. The cookie carries only { uid, role, exp } plus an
// HMAC-SHA256 signature keyed by AUTH_SECRET, so it can't be forged or edited.
// Every read re-loads the user from the database, so bans, suspensions and
// role changes take effect on the next request instead of when the cookie expires.

import { cookies } from "next/headers";
import { cache } from "react";
import type { Role } from "@prisma/client";
import { prisma } from "./db";

export type Session = { userId: string; fullName: string; email: string; role: Role };
type Token = { uid: string; role: Role; exp: number };

const COOKIE = "carsu_session";
const MAX_AGE = 60 * 60 * 24 * 7; // seconds
const enc = new TextEncoder();

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET is missing or shorter than 32 characters.");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signToken(t: Token) {
  const body = Buffer.from(JSON.stringify(t)).toString("base64url");
  const sig = await crypto.subtle.sign("HMAC", await secretKey(), enc.encode(body));
  return `${body}.${Buffer.from(sig).toString("base64url")}`;
}

export async function verifyToken(value: string | undefined): Promise<Token | null> {
  const [body, sig, extra] = value?.split(".") ?? [];
  if (!body || !sig || extra !== undefined) return null;
  // crypto.subtle.verify compares in constant time.
  if (!(await crypto.subtle.verify("HMAC", await secretKey(), Buffer.from(sig, "base64url"), enc.encode(body)))) return null;
  try {
    const t = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Token;
    return typeof t.uid === "string" && t.exp > Date.now() / 1000 ? t : null;
  } catch {
    return null;
  }
}

// cache(): layout, header and page each call this; one DB lookup per request.
export const getSession = cache(async (): Promise<Session | null> => {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  let token: Token | null;
  try {
    token = await verifyToken(raw);
  } catch (e) {
    // Missing AUTH_SECRET: treat everyone as signed out rather than crash every page.
    console.error(e);
    return null;
  }
  if (!token) return null;
  const user = await prisma.user.findUnique({
    where: { id: token.uid },
    select: { id: true, fullName: true, email: true, role: true, status: true },
  });
  if (!user || user.status === "BANNED" || user.status === "SUSPENDED") return null;
  return { userId: user.id, fullName: user.fullName, email: user.email, role: user.role };
});

export async function setSession(user: { id: string; role: Role }) {
  const value = await signToken({ uid: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
