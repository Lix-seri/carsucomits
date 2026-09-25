# 0004 — Feature-first structure on top of the Next.js app router

- **Date:** 2026-09-25 · **Status:** Accepted, implemented
- **Evidence:** `claude/audits/STRUCTURE_2026-09-25.md`

**Context.** 21 of 34 components had exactly one importer. One change to commissions touched 5 folders. All 11 queued features are domain-shaped. The requested `frontend/` + `backend/` split doesn't fit a single Next.js app.

**Decision.**
- `src/app/` holds routes only:
  - pages compose;
  - `api/**/route.ts` parses input, checks authentication, and calls a service.
- `src/features/<domain>/` holds that domain's components and `server.ts`. The server file owns the business rules **and the permission checks**.
- `src/components/{ui,layout}` holds only shared pieces.
- `src/lib/` holds infrastructure: db, session, http, format, labels.
- Folders inside a feature stay flat.

**Consequences.**
- Pages and shared components never import the database.
- A route can't skip its permission check, because the check lives in the service it calls.
- CI enforces the boundaries (see `docs/ARCHITECTURE.md`).
