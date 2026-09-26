/**
 * The `next` query parameter after sign-in, if it's a same-site path.
 * Anything that could leave the site (`//evil.com`, `/\evil.com`, `https://…`) is ignored.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

/** Where each role lands after signing in. */
export function homeFor(role: string) {
  return role === "ADMIN" ? "/admin" : role === "USED" ? "/used" : "/dashboard";
}
