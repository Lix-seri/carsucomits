# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added (Phase 5)
- **Transaction history:** `/transactions` shows your own hired commissions (date, other party, amount, status); admins get `/admin/transactions` with status, date and person filters.
- **Audit log:** append-only, with before/after values for account, role, moderation, approval, status, setting and word-list changes. Database triggers reject edits and deletes. The activity log can be filtered.
- **Limits:** admins set the maximum pending applications and unfinished jobs per student on `/admin/settings`; applying or hiring past a limit is refused with a clear message.
- **Available / Busy** on profiles and applicant rows, worked out from unfinished jobs.
- **Flagged words:** an admin-managed list, with matching that sees through spacing, case, accents, look-alike numbers and stretched letters. Flagged commissions and messages are held until an admin reviews them on `/admin/moderation`; cover letters and skills go to the same queue.
- **CCIS verification:** only verified students can apply or be hired. Students submit their ID number and proof on `/verify`; the proof is private to staff. Verified accounts show a badge.
- **Academic work ban:** an academic-dishonesty word category, the rule in the agreement, a Terms section and the post form, and a "Report this commission" button.
- **Agreement before work:** after hiring, both people accept a versioned agreement (scope, fare, deadline, rules) before the commission can start; enforced by a database trigger.
- **USED officers:** a separate role, assigned by admins, that reviews verifications and suspends or reinstates student sellers in `/used`.

### Changed (Phase 5)
- The university is named "Caraga State University – Main Campus" or "CSU Main" everywhere (decision 0015 lists each change).
- `/commissioner` is now `/hiring` and `/admin/listings` is `/admin/commissions`; the old URLs redirect permanently. Back on a commission returns to the page you came from.
- Hiring someone no longer starts the work immediately; the commission waits for the agreement.

### Design (Phase 4)
- One visual system: semantic colour tokens, the Geist font, a 12 px text floor, and one badge family for every status and category. No gradients, no emoji used as icons, and a lint rule that rejects raw palette colours.
- Signed-in pages share one shell; every page has a titled header, loading skeletons and empty states that say what to do next.
- Tables turn into labelled cards on phones.
- The commission page and My hub show where a commission is in its lifecycle (posted → hired → delivered → completed and rated).
- Admin moderation is one "Moderate…" dialog per user that names the person and requires a reason; admin accounts can't be moderated; the activity log reads as sentences.
- The landing page is shorter and leads with how a commission works; sign-in, register, about and the footer use sentence case and the same calm styling.
- A field's error disappears as soon as you edit it.

### Security
- The session cookie is now HMAC-signed with `AUTH_SECRET`, and the user is re-loaded on every request. Previously any visitor could forge a session for any account, including the admin. Everyone was signed out once. `AUTH_SECRET` (32+ characters) is now required.
- Banned and suspended users lose access on their next request instead of when their cookie expires.
- Admin pages check the admin role themselves; they no longer rely on the layout's redirect.

### Security (Phase 2 audit)
- Every API request is validated (zod); bad input returns 400 with the field name instead of a 500.
- 5 failed sign-ins lock an account for 15 minutes.
- MFA can no longer be switched off through the setup endpoint.
- Reported users no longer see who reported them.
- The seed no longer uses or resets a public admin password (`SEED_ADMIN_PASSWORD`).
- Search no longer exposes account status or matches on email; logout is POST-only; admin profiles are hidden.

### Fixed
- Commissions with an approved deliverable can be completed (was a dead end).
- The home page shows real listings instead of mock data with broken links.
- Signed-in and admin screens work on phones (sidebar drawer, no sideways scrolling).
- No more fake "Verified" badges or hard-coded 4.8 rating.
- Signed-out visitors are sent to login and back; a real 404 page; Terms of Use; dead links removed.
- Re-applying after withdrawing works; ratings are final; greeting uses Manila time; SQL is no longer logged.

### Added
- `npm run db:local`: a local Postgres, so no Neon account is needed for development and tests.
- Unit tests (`npm test`, `node:test`) and a Playwright end-to-end suite covering the full marketplace flow and every page per role, on desktop and mobile (`npm run test:e2e`).
- `docs/`: architecture, API, data model, contributing, deployment, security and roadmap.
- `claude/`: prompts, audits and decision records.

### Changed
- The code is organised by feature (`src/features/<domain>/`). Route handlers are thin, and business rules plus permission checks live in each feature's `server.ts`. No page or shared component queries the database directly.
- Duplicated helpers (fare formatting, relative time, labels, KPI and stat tiles, the admin tables) now live in one place each.
- Rating averages in the admin tables, applicant lists and search come from one grouped query instead of one query per row.

### Removed
- The fake admin Settings page, the no-op Filter button and the fake admin bell.
- Dead code: an unused post-commission modal, legacy SQLite type definitions, and an unused helper.
- The uncalled `POST /api/ratings` and `GET /api/saved` endpoints.

## [0.1.0] — 2026-09-25

Baseline: the state of `main` before this work began. See `docs/releases/0.1.0.md`.

[Unreleased]: https://github.com/Lix-seri/carsucomits/compare/ad341f1...HEAD
[0.1.0]: https://github.com/Lix-seri/carsucomits/tree/ad341f1
