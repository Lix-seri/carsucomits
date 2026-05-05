// Lightweight cookie session — sufficient for the academic project.
// Replace with iron-session or NextAuth for production.

import { cookies } from "next/headers";

export type Session = {
  userId: string;
  fullName: string;
  email: string;
  role: "STUDENT_EMPLOYEE" | "COMMISSIONER" | "ADMIN";
};

const COOKIE = "carsu_session";

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as Session;
  } catch {
    return null;
  }
}

export async function setSession(s: Session) {
  const c = await cookies();
  const value = Buffer.from(JSON.stringify(s)).toString("base64");
  c.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const c = await cookies();
  // Overwrite with an immediately-expired empty cookie, then delete.
  c.set(COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" });
  c.delete(COOKIE);
}
