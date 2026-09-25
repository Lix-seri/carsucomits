# 0013 — Both parties accept a versioned agreement before work starts

- **Date:** 2026-09-26 · **Status:** Accepted

**Context.** Item 10 says the poster and the hired student must both accept an agreement covering scope, price, deadline and the prohibited-work rules before a commission can be "in progress". Each acceptance must be stored with the user, the timestamp and the agreement version, and audit-logged.

**Decision.**
- **New status `AGREEMENT_PENDING`**, between `OPEN` and `IN_PROGRESS`.
  - Accepting an applicant now moves the commission to `AGREEMENT_PENDING` instead of straight to `IN_PROGRESS`.
  - The stepper reads "Posted → Hired → Delivered → Completed", with "Hired" covering both states.
- **The agreement text is code** (`src/features/agreements/agreement.ts`) with a version string. Changing the text means bumping the version.
- **`AgreementAcceptance`** stores:
  - the commission, the user and the version;
  - a snapshot of the terms both sides saw: title, description, fare and deadline;
  - `acceptedAt`.
  - It is unique per commission, user and version.
- **Once both parties have accepted the current version**, the commission moves to `IN_PROGRESS` in the same transaction.
- **Database rule:** a trigger on `Commission` refuses a change to `IN_PROGRESS` unless both parties have an acceptance row. A bug elsewhere in the code can't skip the agreement.
- **Audit:** each acceptance is logged (`AGREEMENT_ACCEPTED`), and so is the status change (`COMMISSION_STATUS`, before and after).
- **Editing:** the poster can't edit the fare, the description or the deadline once the commission is hired; changing them before hiring is already the only path.
- **Declining:** either side can decline the agreement. That cancels the hire: the application becomes `REJECTED`, the commission goes back to `OPEN`, and any acceptance already given is kept as history.

**Consequences.** Commissions accepted before this change stay `IN_PROGRESS`. The trigger only checks transitions, not existing rows.
