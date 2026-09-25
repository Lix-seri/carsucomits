// Structure rules ESLint can't express (docs/ARCHITECTURE.md → Rules). Fails CI on violation.
//  1. A feature imports another feature only through its server.ts or schemas.ts.
//  2. Features never import from src/app (routes depend on features, not the reverse).
//  3. Every API route that reads a body or query string validates it with a schema
//     from a feature's schemas.ts. Routes that predate the rule are listed below; the
//     list may only shrink: the check also fails when a listed route is already fixed.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const UNVALIDATED_BASELINE = new Set([
  // Phase 2 adds a zod schema to each of these and removes it from this list.
  "src/app/api/admin/reports/[id]/action/route.ts",
  "src/app/api/admin/users/[id]/action/route.ts",
  "src/app/api/auth/login/route.ts",
  "src/app/api/auth/mfa/disable/route.ts",
  "src/app/api/auth/mfa/enable/route.ts",
  "src/app/api/auth/register/route.ts",
  "src/app/api/commissions/[id]/apply/route.ts",
  "src/app/api/commissions/[id]/complete/route.ts",
  "src/app/api/commissions/[id]/cover/route.ts",
  "src/app/api/commissions/[id]/deliverables/route.ts",
  "src/app/api/commissions/[id]/rate-now/route.ts",
  "src/app/api/commissions/route.ts",
  "src/app/api/deliverables/[id]/decision/route.ts",
  "src/app/api/messages/route.ts",
  "src/app/api/notifications/route.ts",
  "src/app/api/profile/avatar/route.ts",
  "src/app/api/ratings/commissioner/route.ts",
  "src/app/api/reports/route.ts",
  "src/app/api/search/route.ts",
  "src/app/api/skills/route.ts",
]);

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
const rel = (p) => relative(process.cwd(), p).split(sep).join("/");
const imports = (src) => [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);

const errors = [];

for (const file of files("src/features").map(rel)) {
  const own = file.split("/")[2];
  for (const spec of imports(readFileSync(file, "utf8"))) {
    const m = /^@\/features\/([^/]+)\/(.+)$/.exec(spec);
    if (m && m[1] !== own && !["server", "schemas"].includes(m[2])) {
      errors.push(`${file}: imports ${spec}; another feature is reachable only through its server.ts or schemas.ts`);
    }
    if (spec.startsWith("@/app/")) errors.push(`${file}: imports ${spec}; features must not depend on routes`);
  }
}

const readsInput = /readJson\(|\.formData\(|searchParams/;
const validated = /from\s+["']@\/features\/[^/]+\/schemas["']/;
for (const file of files("src/app/api").map(rel).filter((f) => f.endsWith("/route.ts"))) {
  const src = readFileSync(file, "utf8");
  if (!readsInput.test(src)) continue;
  const ok = validated.test(src);
  if (!ok && !UNVALIDATED_BASELINE.has(file)) errors.push(`${file}: reads request input without a schema from a feature's schemas.ts`);
  if (ok && UNVALIDATED_BASELINE.has(file)) errors.push(`${file}: now validated; remove it from UNVALIDATED_BASELINE in scripts/check-structure.mjs`);
}
for (const file of UNVALIDATED_BASELINE) {
  try { statSync(file); } catch { errors.push(`${file}: listed in UNVALIDATED_BASELINE but no longer exists; remove it`); }
}

if (errors.length) {
  console.error(`Structure check failed (${errors.length}):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("Structure check passed.");
