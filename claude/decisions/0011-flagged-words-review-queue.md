# 0011 — Flagged words: normalized matching and a review queue

- **Date:** 2026-09-26 · **Status:** Accepted

**Context.** Items 5 and 9 ask for an admin-managed word list that catches simple evasions, with flagged content sent to an admin review queue instead of vanishing. Academic-dishonesty terms get their own category.

**Decision.**
- **Word list.** `FlaggedWord` rows have a `term` and a `category`: `GENERAL` or `ACADEMIC_DISHONESTY`. The migration seeds a starter list, and admins add and remove terms on `/admin/moderation`.
- **Normalization** (`src/lib/flagged-words.ts`, unit tested):
  - Lower-case the text and strip accents.
  - Map look-alikes: 0→o, 1/!/|→i, 3→e, 4/@→a, 5/$→s, 7→t, 8→b.
  - Drop everything that isn't a letter.
  - Collapse runs of the same letter.
  - Terms get the same treatment, so "t h e s i s", "th3sis" and "THESSIS" all match "thesis".
- **Matching.** A match is a substring of the normalized text. Substring matching over-flags a little ("classic" contains "ass"), which is why nothing is deleted automatically: a person decides.
- **What happens to flagged content.** Where holding is safe, the content is held until an admin decides:
  - **Commissions:** hidden from Browse and search. The poster sees an "Under review" notice. Approving publishes it; removing cancels it.
  - **Messages:** saved but not delivered. The sender sees "Held for review". Approving delivers it; removing keeps it hidden from the recipient.
  - **Profile bios and application cover letters:** saved and visible, because holding them would block the person's whole profile or application. They still go to the queue, and an admin can remove the text.
- Every flag writes a `FlaggedContent` row and an audit entry (`CONTENT_FLAGGED`). Every decision writes another (`CONTENT_APPROVED` / `CONTENT_REMOVED`).

**Consequences.** A determined user can still evade a word list; the report button and admin review are the backstop.
