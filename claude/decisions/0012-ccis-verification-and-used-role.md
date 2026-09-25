# 0012 — CCIS verification, and USED as its own role

- **Date:** 2026-09-26 · **Status:** Accepted

**Context.** Item 6: only verified CCIS students can offer commissions. A student submits an ID number and proof, an admin approves or rejects it, and verified accounts show a badge. Item 11: add a USED (University Student Enterprise Development) role that oversees student sellers, and decide whether it is the same as admin.

**Decision: what "offer commissions" means.** Offering a service means working on a commission: applying to one and being hired. Posting a commission is asking for help, so any signed-in student can still post. Unverified students can browse, post, save and message, but applying is refused (server rule, 403) with a link to the verification form.

**Decision: verification.**
- A `StudentVerification` row stores:
  - the student ID number, format `NNN-NNNNN`, as printed on CSU IDs;
  - the college, which must be CCIS;
  - the proof image;
  - a status (`PENDING`, `APPROVED`, `REJECTED` or `REVOKED`), the reviewer, the decision time and a note.
- One pending request per student at a time. A rejected student can resubmit.
- The proof is stored in the database (a `bytea` column, JPG/PNG/WebP/PDF up to 2 MB), not in public Vercel Blob storage. A student ID is personal data, and Blob URLs are public to anyone who has the link. The proof is served only through `/api/verification/[id]/proof`, which checks for an admin or USED session. This also makes the flow work locally and in tests without a Blob token.
- `User.verifiedAt` is set on approval and cleared on revoke. The badge and the apply rule read it.
- The email rule stays `@carsu.edu.ph` (0003) and is checked again on submission.

**Decision: USED is a separate role.** `Role.USED` sits beside `ADMIN`. Least privilege is the reason: USED manages student enterprises, not the platform.
- **USED can:**
  - list student sellers (verified students) with their activity and transaction totals;
  - review verification requests;
  - suspend a seller (revoke verification) and reinstate one.
- **USED cannot:**
  - moderate accounts;
  - read the audit log;
  - edit settings or the word list;
  - see reports.
- **Admins** can do everything USED can.
- Only an admin can make someone a USED officer, on `/admin/users`. The role change is audit-logged with before and after values.
- USED officers sign in on the Admin tab, since they are staff, and land on `/used`.

**Consequences.** "Seller suspended" (verification revoked) is separate from "account suspended": a revoked seller can still post and message. A second staff role means a second nav and guard, kept small by reusing the admin tables.
