// Applies pending Prisma migrations; runs as part of `npm run build`.
// A database created earlier with `prisma db push` already has the tables but no
// migration history (Prisma error P3005). In that case the 0_init baseline is
// marked as applied once, and the remaining migrations run normally.
import { spawnSync } from "node:child_process";

const prisma = (...args) => spawnSync("npx", ["prisma", ...args], { encoding: "utf8", shell: true });
const echo = (r) => { process.stdout.write(r.stdout ?? ""); process.stderr.write(r.stderr ?? ""); };

let result = prisma("migrate", "deploy");
echo(result);

if (result.status !== 0 && /P3005/.test(`${result.stdout}${result.stderr}`)) {
  console.log("\nExisting database without migration history: marking 0_init as applied (one-time baseline).\n");
  const baseline = prisma("migrate", "resolve", "--applied", "0_init");
  echo(baseline);
  if (baseline.status !== 0) process.exit(baseline.status ?? 1);
  result = prisma("migrate", "deploy");
  echo(result);
}
process.exit(result.status ?? 1);
