import { execSync } from "node:child_process";

// Wipe the test database and seed the admin before every run.
export default function globalSetup() {
  const env = {
    ...process.env,
    DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/carsucomits_test",
  };
  execSync("npx prisma db push --force-reset --skip-generate --accept-data-loss", { env, stdio: "inherit" });
  execSync("node prisma/seed.mjs", { env, stdio: "inherit" });
}
