# 0005 — Local Postgres and the test stack

- **Date:** 2026-09-25 · **Status:** Accepted, implemented

**Decision.**
- **Local database:** `embedded-postgres` (dev dependency, real Postgres binaries) behind `npm run db:local`. No Neon account is needed for development or tests. The tests use their own database, `carsucomits_test`, which is reset before every run.
- **Unit tests:** Node's built-in `node:test`, run through `tsx` (already installed). No test framework dependency.
- **End-to-end tests:** Playwright against a **production build**, because dev mode recompiles per page and timed out. Desktop and Pixel 7 projects.
  - Locally the tests use the installed Chrome (`channel: "chrome"`), because the Chromium download kept timing out on this network.
  - CI uses Playwright's bundled Chromium.
