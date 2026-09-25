# Roadmap

Work is done in phases (see `claude/prompts/0001-…`). Status here is updated at the end of each batch; the detail is in `claude/reports/`.

| Phase | Scope | Status |
|---|---|---|
| 1 | Understand the codebase | Done |
| — | Repository restructure (feature-first, checks, docs, versioning) | Done |
| 2 | QA and security audit; fix every Critical and High finding | In progress |
| 3 | Playwright walkthroughs for every role, desktop and mobile; replace native dialogs | Started (smoke suite exists) |
| 4 | Design critique and improvement | Not started |
| 5 | The 11 feature items below | Not started |
| 6 | Final verification and report | Not started |

## Phase 5 items

| # | Item | Status |
|---|---|---|
| 1 | Transaction history (own for users, all with filters for admins) | Open |
| 2 | Append-only audit log with before/after, admin-only, database-enforced | Open |
| 3 | Admin-configurable cap on concurrent applications and held commissions | Open |
| 4 | Available / Busy status derived from active commissions | Open |
| 5 | Admin-managed flagged-word filter with normalization and a review queue | Open |
| 6 | CCIS student verification (student ID + proof, admin review, badge) | Open |
| 7 | Standardize "Caraga State University – Main Campus" / "CSU Main" | Open |
| 8 | Routing: guards, redirects, 404, back navigation, no orphans | Open |
| 9 | Prohibit academic work (rules, flagged-word category, report button) | Open |
| 10 | User-to-user agreement before work starts | Open |
| 11 | USED role overseeing student enterprises | Open |
