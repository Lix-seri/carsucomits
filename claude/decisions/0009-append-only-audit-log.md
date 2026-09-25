# 0009 — Append-only audit log with before/after values

- **Date:** 2026-09-26 · **Status:** Accepted

**Context.** Phase 5 item 2 asks for a log of important actions: who did it, what, when, and the before/after values. Only admins may read it, and nobody may edit or delete an entry, enforced in the database if the stack allows. The existing `AuditLog` table had `actor`, `action`, `target` and a free-form `meta` string, and nothing stopped an `UPDATE` or `DELETE`.

**Decision.**
- Add `before` and `after` JSONB columns. `meta` stays for context that isn't a field change, such as a reason or an email address.
- A Postgres trigger rejects every `UPDATE` and `DELETE` on `AuditLog`, and a statement trigger rejects `TRUNCATE`, whoever sends the statement. Dropping the whole schema (what `prisma migrate reset` does for tests) still works, because that is an owner-level operation, not a row change.
- Every write goes through one helper, `audit()` in `src/lib/audit.ts`, so the shape is the same everywhere. It accepts a transaction client, so an entry commits or rolls back with the change it describes.
- The following are logged:
  - Sign-ins and failed sign-ins.
  - MFA changes.
  - Profile edits.
  - Role changes.
  - Moderation.
  - Report decisions.
  - Application accept and decline.
  - Every commission status change.
  - Deliverable approve and revise.
  - Verification decisions.
  - Agreement acceptances.
  - Flagged-content decisions.
  - Settings and word-list edits.
- Only admins can read the log (`/admin/logs`). USED officers cannot (see 0012).

**Consequences.** A mistaken entry can't be corrected, only followed by another entry. A superuser can still disable the trigger; that is outside what an application can prevent, and Neon's own history covers it.
