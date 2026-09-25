# 0010 — Application and job limits are an admin setting

- **Date:** 2026-09-26 · **Status:** Accepted

**Context.** Item 3 asks for a cap on how many commissions a student can apply to, or hold, at once. The cap must be an admin setting, not a constant.

**Decision.**
- A `Setting` table keyed by name holds integer values. A `CHECK` constraint keeps every value between 1 and 50.
- There are two keys:
  - `MAX_PENDING_APPLICATIONS`, default 5: applications still waiting for a decision.
  - `MAX_ACTIVE_JOBS`, default 2: commissions awarded to the student that aren't finished (agreement pending, in progress, or awaiting review).
- A missing row means the default, so a fresh database works without a seed.
- Applying is refused with a 409 and a message that names the limit when either cap is reached. Accepting an applicant is refused when that applicant already holds the maximum number of jobs, so the hold cap can't be bypassed by applying early.
- Admins change the values on `/admin/settings`. Each change is audit-logged with the before and after value.

**Consequences.** Two simultaneous applications could each see "4 of 5" and both succeed. That is acceptable for a soft limit on a campus marketplace. `ponytail:` a `SELECT … FOR UPDATE` on the user row would close the gap if it ever matters.
