// Starts a local Postgres (real binaries from the embedded-postgres package) so the
// app and the Playwright tests can run without a Neon account. Data lives in .data/pg.
// Usage: npm run db:local   (Ctrl+C to stop)
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const dir = ".data/pg";
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "postgres",
  password: "postgres",
  port: 5433,
  persistent: true,
  // UTF-8 like Neon. Without this, Windows clusters default to WIN1252 and reject "₱".
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (!existsSync(dir)) await pg.initialise();
await pg.start();

const admin = pg.getPgClient();
await admin.connect();
for (const db of ["carsucomits", "carsucomits_test"]) {
  const { rows } = await admin.query("SELECT pg_encoding_to_char(encoding) AS enc FROM pg_database WHERE datname = $1", [db]);
  if (rows.length === 0) {
    await admin.query(`CREATE DATABASE "${db}" ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0`);
  } else if (rows[0].enc !== "UTF8") {
    // The test database is wiped on every run, so it's safe to recreate. The dev one may hold your data.
    if (db.endsWith("_test")) {
      await admin.query(`DROP DATABASE "${db}"`);
      await admin.query(`CREATE DATABASE "${db}" ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0`);
      console.log(`Recreated ${db} as UTF-8.`);
    } else {
      console.warn(`${db} uses ${rows[0].enc}, not UTF-8, so text like "₱" can't be stored. Drop it (psql: DROP DATABASE "${db}";) and restart this script to recreate it, then run npm run db:migrate and npm run db:seed.`);
    }
  }
}
await admin.end();
console.log("Postgres ready on postgresql://postgres:postgres@localhost:5433/carsucomits (and carsucomits_test)");

const stop = async () => { await pg.stop(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
