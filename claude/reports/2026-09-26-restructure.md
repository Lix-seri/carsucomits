# Report — repository restructure (prompt 0002)

**Date:** 2026-09-26 · **Commits:** `46690f0` … `6e1cc87` · **Plan:** `claude/audits/STRUCTURE_2026-09-25.md` (approved in prompt 0003)

## Result

- **Tests still pass:**
  - `tsc`, ESLint and the structure check are clean;
  - 6/6 unit tests;
  - 7/7 Playwright cases (1 intentionally skipped on mobile).

  They ran after every step, and the Playwright suite was written against the code **before** the move, so it pins the old behaviour.
- **Behaviour:** unchanged, except for two deliberate, visible additions: the footer shows the version, and the dashboard topbar is now composed by the layout (same DOM).

## Moved

| From | To |
|---|---|
| `components/{site-header,site-footer,logo,logout-button,back-button}.tsx`, `components/dashboard/{sidebar,topbar}.tsx`, `components/admin/admin-sidebar.tsx` | `components/layout/` |
| `components/avatar.tsx` | `components/ui/avatar.tsx` |
| `components/trust-badge.tsx`, `lib/trust.ts` | `components/ui/trust-badge.tsx`, `lib/trust.ts` (after a stop in `features/ratings`) |
| Single-use domain components (apply, withdraw, applicant buttons, bookmark, cover uploader, browse, deliverables, rating dialogs, breakdown, skills, avatar uploader, profile card, search bar, notifications popover, MFA setup, user/report action buttons, landing) | `features/<domain>/` |
| Client pages `login`, `register`, `messages`, `reports`, `commissioner/post` | `features/<domain>/*-form.tsx` / `*-view.tsx`; the page renders them |
| Inline logic in 30 route handlers | `features/<domain>/server.ts` (13 features); handlers are 3–10 lines |
| Prisma queries in 16 pages, 1 layout and `site-header` | Feature services; `getSession()` now carries `avatarUrl` (4 lookups removed) |
| `lib/queries.ts`, `lib/notifications.ts`, `lib/mfa.ts`, `lib/mock-data.ts` | `features/{profile,ratings}/server.ts`, `features/notifications/server.ts`, `features/auth/mfa.ts`, `features/landing/mock-data.ts` |
| `app/globals.css`, Tailwind theme values | `styles/globals.css`, `styles/tokens.ts` |
| `ARCHITECTURE.md`, `SETUP.md`, `DEPLOY.md` | `docs/ARCHITECTURE.md`, `docs/CONTRIBUTING.md`, `docs/DEPLOYMENT.md` (corrected) |

## Merged

- **`formatFare`:** 7 copies → 1.
- **Labels:** `timeAgoShort` (2) and `greeting` (2) → `lib/format.ts`; role/level labels, level colours and option lists → `lib/labels.ts`.
- **UI pieces:** `Kpi` (2) and `Stat` (2) → `components/ui`; the flagged-users table (2) and the report list (2) → shared components.
- **Queries:** per-row rating aggregates in 3 services → one `groupBy`.

## Deleted

- `components/modals/post-commission-modal.tsx`, `modal-shell.tsx` (no importers)
- `lib/types.ts` (SQLite-era unions; Prisma enums instead), `peso()`
- `public/avatars/.gitkeep`
- `POST /api/ratings`, `GET /api/saved` (no callers)

## Added

- **Local database:** `scripts/local-db.mjs` (embedded Postgres) and `scripts/migrate.mjs` (Prisma Migrate with a one-time baseline of `db push` databases).
- **Checks:** `scripts/check-structure.mjs`, `.eslintrc.json`, `.githooks/commit-msg`, `.github/workflows/ci.yml`.
- **Docs and records:** `docs/{API,DATA_MODEL,SECURITY,ROADMAP}.md`, `docs/releases/0.1.0.md`, `CHANGELOG.md`, and `claude/` (prompts, audits, ADRs 0001–0008, PROJECT.md).

## Left alone on purpose

| What | Why |
|---|---|
| `frontend/` + `backend/` split | It's one Next.js app; splitting would rewrite every route (ADR 0004) |
| 7 `CAT_PILL` and 9 `STATUS_PILL` copies, the two listings tables, the `timeAgo` variants | They differ visibly; merging would change the UI. The 59 files with design literals carry an ESLint exemption that Phase 4 removes |
| Three near-identical rating dialogs | Replaced in Phase 3 with the shared dialog component |
| Landing mock data | Deleting it changes the home page. It's audit finding H3, fixed in Phase 2 |
| The auto-flag difference (retroactive ratings don't notify) | Kept as an explicit flag; audit L1, fixed in Phase 2 |
| Unused `PasswordResetToken` / `emailVerified*` columns | Dropping them deletes data; needs the owner's approval |
| Folders from the template (`shared/`, `context/`, `hooks/`, `services/`, `assets/`, `models/`, `.claude/`) | Nothing would go in them yet (rule 7) |
| `version.json` | The version comes from `package.json` (ADR 0006) |
