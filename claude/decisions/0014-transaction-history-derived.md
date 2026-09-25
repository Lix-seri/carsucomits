# 0014 — Transaction history is derived from commissions

- **Date:** 2026-09-26 · **Status:** Accepted

**Context.** Item 1 asks for a history of each user's commissions and payments: date, other party, amount and status. Admins see all transactions with filters, and users see only their own. CarsuComits doesn't process payments (Terms, "Payments"). Money changes hands between the two students, off the platform.

**Decision.**
- No separate payments table. A "transaction" is a commission that has been hired: `awardedToId` is set.
- **Amount:** the fare in the agreement snapshot both sides accepted (0013). For commissions hired before agreements existed, it falls back to the posted fare.
- **Date:** when the agreement was completed, falling back to when the commission was last updated.
- **Other party:** the poster or the hired student, whichever isn't you.
- **Status:** the commission's status.
- **Users** see `/transactions`: their own rows, as poster ("You paid") and as worker ("You earned"), with totals for completed work.
- **Admins** see `/admin/transactions` with filters for status, date range and a person's name or email.
- The server functions filter by `session.userId` for students, so the rule lives in one place.

**Consequences.** "Paid" means "completed", not "money received": the app can't know whether the students settled. The page says so. A real payment integration would add its own table and replace the fallback amounts.
