// Starts a local Postgres (real binaries from the embedded-postgres package) so the
// app and the Playwright tests can run without a Neon account. Data lives in .data/pg.
// Usage: npm run db:local   (Ctrl+C to stop)
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const dir = ".data/pg";
const pg = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port: 5433, persistent: true });

if (!existsSync(dir)) await pg.initialise();
await pg.start();
for (const db of ["carsucomits", "carsucomits_test"]) {
  await pg.createDatabase(db).catch(() => {}); // already exists
}
console.log("Postgres ready on postgresql://postgres:postgres@localhost:5433/carsucomits (and carsucomits_test)");

const stop = async () => { await pg.stop(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
