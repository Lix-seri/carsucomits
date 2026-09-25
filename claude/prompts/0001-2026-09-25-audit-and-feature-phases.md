# 0001 — 2026-09-25 — Audit, redesign and feature phases

Verbatim.

---

You are working on carsucommits, a web platform where CSU students offer and take on commissions. Your job in this session: understand the whole codebase, audit it, improve the UI, then implement the fixes listed below. Work in phases and do not skip ahead.

## Ground rules
- Only claim what the code actually does. Never report something as done unless you built it and verified it.
- Enforce rules on the server and database, not just in the UI. Hiding a button is not a permission check.
- Prefer simple, direct code. Don't add abstractions, layers, or libraries the task doesn't need.
- Make small commits, one per logical change, with clear messages.
- If a requirement is ambiguous, pick the most reasonable interpretation, write it down in DECISIONS.md, and keep going. Stop and ask me only if a choice is hard to reverse (schema design, deleting data, auth changes).

## Phase 1 — Understand the codebase
Read the whole project before changing anything: stack, folder structure, routes, data model and migrations, auth and roles, environment variables, and how it deploys.
Write ARCHITECTURE.md summarizing it: stack, roles, main user flows, data model, and anything fragile or confusing.

## Phase 2 — QA and security audit
Audit the code and write AUDIT.md, grouping findings by severity (Critical / High / Medium / Low). Each finding needs its file, line, the problem, and the fix. Cover:
- Broken or dead features, runtime errors, failing or missing tests
- Auth and authorization gaps: can a user read or change another user's data? Are role checks enforced server-side?
- Input validation, injection risks, exposed secrets, unsafe file uploads
- Data sent to the browser that shouldn't be (private fields in API responses)
- Routing problems: broken links, missing 404s, unprotected pages, bad redirects
- Accessibility basics and mobile layout issues
Fix every Critical and High finding before Phase 3. Log what you fixed in AUDIT.md.

## Phase 3 — Browser QA with Playwright
Use Playwright to walk through every main user flow for every role, on desktop and mobile sizes. Capture screenshots of each page.
Record anything broken, confusing, or ugly in AUDIT.md.
Turn the main flows into Playwright tests that stay in the repo and run before each release.
Replace native browser popups (alert/confirm, "localhost says") and native form validation bubbles with the site's own dialogs and inline field messages.

## Phase 4 — Design improvement with Taste and Impeccable
Use the Taste and Impeccable skills to critique the UI from the Phase 3 screenshots, then improve it. Aim for a consistent, deliberate design, not a generic template look: clear hierarchy, consistent spacing and type, clear empty/loading/error states, and good mobile layouts. Don't redesign working flows just for novelty. Re-run Playwright after the changes.

## Phase 5 — Feature fixes
Implement the items below. My intent is described for each one. Record your design choices in DECISIONS.md.

1. **Transaction History** — Each user sees a history of their commissions and payments: date, other party, amount, and status. Admins see all transactions, with filters. Users can only see their own.
2. **Audit Logs** — An append-only log of important actions: account changes, role changes, approvals and rejections, commission status changes, moderation actions, and admin edits. Record who, what, when, and the before/after values. Only admins can view it, and nobody can edit or delete entries. Enforce this at the database level if the stack allows.
3. **Limitation on Applying** — Cap how many commissions a user can apply to or hold at once. Make the limit a configurable admin setting, not hard-coded. Enforce it server-side and show a clear message when a user hits it.
4. **Active status** — Show whether a person is currently working on a commission (for example, Available / Busy). Derive it from their actual active commissions so it can't go stale. It should appear on profiles and in listings.
5. **Flagged words** — Filter user-generated text (posts, commission descriptions, messages, profiles) against a word list that admins manage. Normalize text so simple evasions are caught (case, spacing, symbol and number substitutions). Flagged content goes to an admin review queue instead of silently disappearing, and every flag is written to the audit log.
6. **Verify if CCIS students** — Only verified CCIS students can offer commissions. Build a verification flow: the student submits their student ID number and a proof upload, an admin approves or rejects it, and verified accounts get a visible badge. Unverified users can browse but not offer services. The institutional email domain is: [FILL IN, or delete this sentence if you don't use one]. If you use it, check it as well.
7. **CSU Main naming** — Standardize the university name everywhere (UI text, page titles, metadata, emails, seed data) to one official form: "Caraga State University – Main Campus", shortened to "CSU Main" where space is tight. List every place you changed in DECISIONS.md.
8. **Better routing** — Clean, predictable URLs; role-based route guards; redirects for logged-in and logged-out users; a proper 404 page; working back navigation and deep links. Remove any orphaned routes.
9. **Prohibit thesis making** — Academic work such as thesis, capstone, research paper writing, and graded assignments is not allowed. Enforce this in three places: a clear rule in the terms and on the post-a-commission form, a dedicated flagged-word category for academic-dishonesty terms that routes posts to admin review, and a report button so users can flag violations.
10. **User-to-user agreement** — Before a commission starts, both parties must accept an agreement covering scope, price, deadline, and the prohibited-work rules (including no thesis or academic work). Store each acceptance with the user, timestamp, and agreement version. The commission can't move to "in progress" until both have accepted. Log acceptances in the audit log.
11. **University Student Enterprise Development (USED)** — USED is the organization that manages students' businesses. Add a USED role that can oversee student enterprises: view registered student sellers, see their activity and transaction summaries, and approve or suspend them. Decide whether USED is a separate role from the site admin or the same role, and record the decision in DECISIONS.md.

For each item: update the data model with migrations, implement the backend rule, build the UI, add tests (unit plus a Playwright flow), and log any new admin or security actions in the audit log.

## Phase 6 — Final verification and report
Run the full test suite, the Playwright flows, and a final mobile check. Then write CHANGES.md containing:
- A table of all 11 items with a status of Done / Partial / Open, plus one line on what was built or what's missing
- Audit findings fixed and any still open
- The test counts that pass
- Known limitations and anything I need to configure (environment variables, storage, email)

Start with Phase 1.

---

## Follow-up messages during Phase 1 (verbatim)

> also, every changes, i want you to push it to the repo as Kurtisrael12, dont leave a trace that it was pushed by claude

> no push it on main, no  branches

## Answers to Claude's Phase 2 questions

| Question | Answer |
|---|---|
| How to fix the forgeable session cookie | Sign it + DB re-check (Recommended) |
| How migrations reach Neon | Auto on Vercel build (Recommended) |
| Institutional email domain for CCIS verification | Keep @carsu.edu.ph |
