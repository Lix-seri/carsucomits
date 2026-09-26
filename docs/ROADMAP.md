# Roadmap

Work is done in phases (see `claude/prompts/0001-…`). Status here is updated at the end of each batch; the detail is in `claude/reports/`.

| Phase | Scope | Status |
|---|---|---|
| 1 | Understand the codebase | Done |
| — | Repository restructure (feature-first, checks, docs, versioning) | Done |
| 2 | QA and security audit; fix every Critical and High finding | Done (all Critical/High fixed; see claude/audits/AUDIT_2026-09-25.md) |
| 3 | Playwright walkthroughs for every role, desktop and mobile; replace native dialogs | Done |
| 4 | Design critique and improvement | Done (claude/audits/DESIGN_2026-09-26.md) |
| 5 | The 11 feature items below | Done (decisions 0009–0015) |
| 6 | Final verification and report | Not started |

## Phase 5 items

| # | Item | Status |
|---|---|---|
| 1 | Transaction history (own for users, all with filters for admins) | Done |
| 2 | Append-only audit log with before/after, admin-only, database-enforced | Done |
| 3 | Admin-configurable cap on concurrent applications and held commissions | Done |
| 4 | Available / Busy status derived from active commissions | Done |
| 5 | Admin-managed flagged-word filter with normalization and a review queue | Done |
| 6 | CCIS student verification (student ID + proof, admin review, badge) | Done |
| 7 | Standardize "Caraga State University – Main Campus" / "CSU Main" | Done |
| 8 | Routing: guards, redirects, 404, back navigation, no orphans | Done |
| 9 | Prohibit academic work (rules, flagged-word category, report button) | Done |
| 10 | User-to-user agreement before work starts | Done |
| 11 | USED role overseeing student enterprises | Done |
