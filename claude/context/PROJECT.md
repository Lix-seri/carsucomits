# PROJECT — read this first

_Last updated: 2026-09-25, after the repository restructure._

## What this is

CarsuComits is a commission marketplace for **Caraga State University – Main Campus** students. Users post paid tasks (commissions), others apply, the poster hires one, and deliverables are reviewed. Completion requires a rating, and the student rates back. There's also messaging, notifications, reports and an admin panel.

- **Owner / repo:** `Lix-seri/carsucomits`. Commits go directly to `main` as `KurtIsrael12`.
- **Deploys:** pushes don't deploy. The owner has no deploy access, so the production Vercel/Neon setup is someone else's.

## Stack

- Next.js 15 App Router + React 19 + TypeScript, and Tailwind 3.
- Prisma 5 on PostgreSQL. Blob storage is Vercel Blob.
- Tests:
  - unit tests on `node:test` + `tsx`;
  - end-to-end tests on Playwright (production build, desktop + Pixel 7) against a local embedded Postgres (`npm run db:local`).

## Structure

`src/app` holds routes only. `src/features/<domain>/server.ts` holds the business rules and permission checks, with the domain's components next to it. `src/components/{ui,layout}` holds shared UI, and `src/lib` holds infrastructure. Details are in `docs/ARCHITECTURE.md`.

## Standing rules

**Owner's instructions**
- **Commits:** small, Conventional Commits, straight to `main`, pushed after each change. Commits carry no Claude attribution.
- **Ask before hard-to-reverse choices:** stop and ask only for schema design, deleting data, or auth changes. Otherwise pick the reasonable interpretation, record it in `claude/decisions/`, and continue.
- **Honest reporting:** never report something as done unless it was built and verified.
- **Server-side enforcement:** enforce rules on the server and in the database. Hiding a button isn't a permission check.
- **Ponytail:** the simplest code that works; no speculative layers, wrappers, or single-caller config.

**Code rules** (CI will enforce these once `ci.yml` lands, see ARCHITECTURE → Rules)
- Pages never import the database.
- Services check permissions.
- 300-line file limit.
- No new design literals.
- Every body-reading route has a zod schema.

**Version and release notes**
- The version lives in `package.json`, and the footer shows it.
- Every batch adds to `CHANGELOG.md [Unreleased]` and updates this file and `docs/ROADMAP.md`.

## Built so far

- **Phase 1:** architecture write-up, done.
- **Security hotfix:** signed session cookie plus a DB re-check on every request (ADR 0001).
- **Restructure:** feature-first layout; thin routes; services own authorization; shared helpers de-duplicated; docs, changelog and ADRs.
- **Test harness:** 6 unit tests; a Playwright smoke suite (API flow + every page per role, desktop and mobile).

## In progress / next

1. Finish the restructure tooling:
   - ESLint config with boundary, line and literal rules;
   - the structure-check script;
   - the Conventional Commits hook;
   - CI;
   - the Prisma Migrate baseline plus migrate-on-build (ADR 0002);
   - design tokens;
   - the footer version.
2. Phase 2: `claude/audits/AUDIT_<date>.md`, then fix every Critical and High finding. Add zod validation per endpoint (ADR 0007).
3. Phases 3–6 per `claude/prompts/0001-…`.

## Blocked / needs the owner

- **Production env and migrations:** `AUTH_SECRET` must be set in whichever Vercel project deploys this, or nobody can sign in. Migrations need `DATABASE_URL` at build time. Owner: whoever controls the Vercel project.
- **Uploads:** `BLOB_READ_WRITE_TOKEN` is needed for real uploads. Locally and in tests, uploads fail without it.
