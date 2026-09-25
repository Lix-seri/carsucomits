# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Security
- The session cookie is now HMAC-signed with `AUTH_SECRET`, and the user is re-loaded on every request. Previously any visitor could forge a session for any account, including the admin. Everyone was signed out once. `AUTH_SECRET` (32+ characters) is now required.
- Banned and suspended users lose access on their next request instead of when their cookie expires.
- Admin pages check the admin role themselves; they no longer rely on the layout's redirect.

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
- Dead code: an unused post-commission modal, legacy SQLite type definitions, and an unused helper.
- The uncalled `POST /api/ratings` and `GET /api/saved` endpoints.

## [0.1.0] — 2026-09-25

Baseline: the state of `main` before this work began. See `docs/releases/0.1.0.md`.

[Unreleased]: https://github.com/Lix-seri/carsucomits/compare/ad341f1...HEAD
[0.1.0]: https://github.com/Lix-seri/carsucomits/tree/ad341f1
