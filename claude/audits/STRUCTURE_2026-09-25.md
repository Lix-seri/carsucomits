# Structure audit — 2026-09-25

Scope: repository layout only. **Nothing has been moved.** Everything under [Plan](#plan) waits for approval.

Baseline measured before writing this:
- `tsc --noEmit` passes.
- `next build` passes.
- There are **0 tests**.
- `next lint` has no config file and would prompt interactively.

## Stack correction

Your template assumes Vite + React (frontend) and Express (backend). This repo is a **single Next.js 15 App Router app**:
- Pages and API route handlers live side by side under `src/app/`.
- One `package.json`.
- It deploys to Vercel as a single unit.

Splitting it into `frontend/` and `backend/` would mean rewriting the API as an Express server and the pages as a Vite SPA. That is a behaviour change on every route, so I'm **flagging it rather than doing it**. The plan below keeps the template's principles and maps each one onto Next.js conventions ([mapping table](#how-the-template-maps-onto-nextjs)).

---

## 1. Current tree

105 source files, about 8,000 lines, plus `prisma/` (2 files, 325 lines).

```
src/
├── app/                              10 files   963 lines   root layout, globals.css, public pages
│   ├── (dashboard)/                  10 files 1,610 lines   signed-in user pages + layout
│   ├── admin/                         8 files   683 lines   admin pages + layout
│   └── api/                          32 files 1,529 lines   route handlers, 1 file per folder
├── components/                       23 files 1,576 lines   everything else, flat
│   ├── admin/                         4 files   391 lines
│   ├── dashboard/                     6 files   712 lines
│   └── modals/                        3 files   184 lines
└── lib/                               9 files   353 lines
prisma/                                2 files   325 lines   schema.prisma, seed.mjs
public/avatars/.gitkeep                                      leftover from local avatar storage
(root) README.md SETUP.md DEPLOY.md ARCHITECTURE.md + configs
```

**Largest files** (none are over 300 lines, but these do more than one job):

| File | Lines | Jobs mixed together |
|---|---|---|
| `app/(dashboard)/messages/page.tsx` | 284 | thread list, conversation view, two polling loops, optimistic send — all in a client page |
| `app/(dashboard)/hub/page.tsx` | 262 | 5 Prisma queries + 5 separate UI sections |
| `app/(dashboard)/dashboard/page.tsx` | 255 | 10 Prisma queries, hero, featured list, hub summary, profile sidebar |
| `app/commission/[id]/page.tsx` | 212 | 5 queries, detail view, action-button state machine, cover uploader, deliverables |
| `app/login/page.tsx` | 204 | role tabs, login form, MFA form |

## 2. Files in the wrong place

| File | Problem | Belongs in |
|---|---|---|
| 16 domain components | Each has exactly **one** importer (e.g. `apply-button`, `deliverable-section`, `cover-image-uploader` are only used by `commission/[id]`) but they sit in shared `components/` | Their feature folder |
| `components/dashboard/{sidebar,topbar}.tsx`, `components/admin/admin-sidebar.tsx`, `site-header.tsx`, `site-footer.tsx`, `logo.tsx`, `logout-button.tsx`, `back-button.tsx` | App chrome, spread across 3 folders | `components/layout/` |
| `components/modals/notifications-popover.tsx` | Folder named after a UI shape, not a domain | `features/notifications/` |
| `components/dashboard/{profile-card,skills-manager,avatar-uploader}.tsx` | Profile domain filed under "dashboard" | `features/profile/` |
| `lib/mock-data.ts` | Fake fixture data that the real landing page renders | Removing it changes the landing page → **flagged**, see §7 |
| `lib/types.ts` | String unions "because SQLite has no enums"; Prisma has generated these enums since the Postgres move | Delete; use `@prisma/client` enums |
| 16 page/layout files importing `@/lib/db` | Pages run Prisma queries directly (the dashboard page runs 10) | Query functions in `features/<domain>/server.ts`; pages call those |
| `components/site-header.tsx` | A shared component running a Prisma query (avatar lookup) | Take the avatar as a prop, or read it once in a server helper |
| 30 API route handlers | Authorization, validation, business rules and notifications are all written inline in each handler | Handler parses and validates, then calls a `features/<domain>/server.ts` function that holds the rules and the permission check |
| `README.md`, `SETUP.md`, `DEPLOY.md`, `ARCHITECTURE.md` at root | Docs mixed into the repo root | `docs/` (README stays at root) |
| `tsconfig.tsbuildinfo` | Build artefact, untracked but not ignored | `.gitignore` |

## 3. Duplicates and near-duplicates

| What | Copies | Where | Safe to merge without behaviour change? |
|---|---|---|---|
| `fareDisplay()` | 7 | dashboard, hub, admin/listings, commission/[id], saved, browse-content, search-bar | **Yes**, all identical |
| `LEVEL_PILL` colour map | 4 | commission/[id], u/[id], browse-content, skills-manager | **Yes**, identical |
| Category/level option lists (`CATS`, `LEVELS`) | 4 | post page, browse-content, skills-manager, dead post modal | **Yes** |
| `timeBasedGreeting()` | 2 | dashboard, commissioner | **Yes** |
| `Kpi` card | 2 (+1 variant) | commissioner, admin; `KpiCard` in admin/listings is a link variant | **Yes** for the 2 identical ones |
| `Stat` tile | 2 | profile, u/[id] | **Yes** |
| "Flagged users" admin table | 2 | admin/page, admin/reports/page | **Yes** |
| `ROLE_LABEL` | 5 | 4 identical admin/profile copies; `search-bar` labels students "Student" instead of "Student Employee" | Yes for the 4; the search-bar one differs |
| Initials from a name | 2 | `avatar.initialsFor`, re-implemented inline in `lib/queries.ts` | **Yes** |
| Per-row `prisma.rating.aggregate` | 11 call sites | admin users, applicants, search, etc. (N+1 queries) | **Yes**: one grouped query, same numbers |
| Star-rating dialog | 3 | `rating-modal`, `rate-now-button`, `rate-commissioner-button` | Yes, if the per-dialog wording stays as props |
| `CAT_PILL` colour map | 7 | 3 different palettes (`-100/-700`, `-50/-700`, `-500/white`) | **No**: merging changes colours → Phase 4 |
| `STATUS_PILL` colour map | 9 | Some copies lack `AWAITING_REVIEW`/`DISPUTED`, so those pills render unstyled | **No**: merging changes visuals → Phase 4 |
| `timeAgo()` | 3 | "5 minutes ago" in `queries.ts` vs "5m ago" in messages and notifications | **No**: the output text differs |
| My-listings table | 2 | commissioner home vs commissioner/listings; the home copy has the incomplete status map | **No**: the visual fix belongs to Phase 4 |
| Low-rating auto-flag logic | 3 | `/complete`, `/rate-now`, `/ratings`; the `/rate-now` copy never notifies the user | **No**: merging changes behaviour, and the difference looks like a bug → Phase 2 |

## 4. Dead files and routes

| Item | Evidence | Action |
|---|---|---|
| `components/modals/post-commission-modal.tsx` | 0 importers (madge `--orphans`); its submit button only fakes a delay | Delete |
| `components/modals/modal-shell.tsx` | Only imported by the dead modal above | Delete |
| `lib/types.ts` | `ROLES`, `CATEGORIES_DB`, all type exports unused; `SKILL_LEVELS` used once and equal to Prisma's `SkillLevel` values | Delete, use the Prisma enum |
| `lib/utils.ts` → `peso()` | 0 callers | Delete the function |
| `public/avatars/.gitkeep` + its 2 `.gitignore` lines | Avatars moved to Vercel Blob | Delete |
| `POST /api/ratings` | No caller in the app. It's an alternative way to rate that duplicates `/complete` and `/rate-now` | Delete, **but it's HTTP surface, so it needs your OK** |
| `GET /api/saved` | No caller; `/saved` queries the database directly | Delete, **same caveat** |
| `PasswordResetToken` model, email-verification columns | Feature removed in `7d4237e` | Schema change → Phase 2/5 with a migration, not part of this pass |
| Tests | None exist | Nothing to keep passing yet; the checks below add the first ones |

## 5. Circular imports

**None.** Checked with `madge --circular` over 105 files.

## 6. Import depth

**Zero** relative imports reach even `../`. Every import uses the `@/` alias. Nothing to fix here, but I'll add a lint rule to keep it that way.

## 7. Recommendation: feature-first

**Feature-first, with Next's `app/` folder as a thin routing layer.** The numbers behind it:

- **Most components already belong to one place.** 21 of the 34 live components have exactly one importer: 16 are domain components (apply, deliverables, MFA setup, skills…) and 5 are app chrome (sidebars, topbar, search bar, back button).
- **Changes already span 5 folders.** Changing how a commission works today touches:
  - `app/api/commissions/**` (6 handlers)
  - `app/commission/[id]`
  - `app/(dashboard)/commissioner/**` (4 pages)
  - `app/(dashboard)/hub`
  - 9 components in `components/`
  - `lib/queries.ts`
- **The 11 queued features are domains, not layers.** Examples: verification, agreements, flagged words, audit log, settings, transactions, USED oversight. Each one needs its UI, server rules, validation schema and permission check together. In a type-first layout, each lands in 4–5 folders.
- **Why type-first appeals, and why it won't last.** At about 8k lines, type-first would be fine *today*. After the 11 features it roughly doubles, and "all components together" becomes a 60-file flat folder.

## Plan

### Target tree (Next.js-adapted)

```
repo/
├── src/
│   ├── app/                    # routes only (Next.js requires this folder)
│   │   ├── **/page.tsx         # compose: call a feature query, render feature components
│   │   └── api/**/route.ts     # thin: auth → validate → call feature server fn → respond
│   ├── features/
│   │   ├── auth/               # login/register forms, MFA
│   │   ├── commissions/        # post, browse, detail, apply, applications, deliverables, cover, bookmarks, completion
│   │   ├── ratings/            # rating dialog, auto-flag, trust tiers, breakdown
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── reports/            # user reports + moderation actions
│   │   ├── profile/            # profile card, skills, avatar
│   │   └── admin/              # admin-only tables and widgets
│   ├── components/
│   │   ├── ui/                 # Avatar, Kpi, Stat (shared primitives only)
│   │   └── layout/             # SiteHeader, SiteFooter, Logo, sidebars, Topbar, LogoutButton, BackButton
│   ├── lib/                    # db, session, format, utils (infrastructure only)
│   └── styles/                 # globals.css + tokens.ts (single source for design values)
├── prisma/                     # schema, migrations/, seed
├── docs/                       # ARCHITECTURE, API, DATA_MODEL, CONTRIBUTING, DEPLOYMENT, SECURITY, ROADMAP, releases/
├── claude/                     # human-readable record (README, context/PROJECT.md, prompts/, audits/, decisions/, reports/)
├── .github/workflows/ci.yml
├── .githooks/commit-msg        # Conventional Commits, no dependency
├── CHANGELOG.md
└── README.md
```

**Inside a feature, files stay flat.** A feature looks like `features/messages/{messages-view.tsx, server.ts, schemas.ts}`. I won't create `components/` or `hooks/` subfolders inside a feature until it has more than about 8 files, and no single-file folders or re-export `index.ts` files anywhere (your rule 7).

Folders from your template I **won't** create:
- `shared/` — one app; the types come from Prisma.
- `context/` — no React context is used.
- `hooks/` — no shared hooks exist.
- `services/` as a client API layer — client fetches stay inside the feature component that makes them.
- `assets/` — there are no images, fonts, or videos.
- `models/` — the Prisma schema *is* the model.
- `.claude/` — no Claude Code config exists yet; I'll create it when there's something to put in it, and both READMEs will explain the split.

### How the template maps onto Next.js

| Template | Here |
|---|---|
| `routes/` + `controllers/` | `app/api/**/route.ts`: parse, validate, call a service, format the response. Nothing else |
| `services/` (logic **and authorization**) | `features/<domain>/server.ts`. Every exported mutation checks its own permission, so a route can't forget |
| `validators/` | `features/<domain>/schemas.ts`, one schema per endpoint |
| `middlewares/` | `src/middleware.ts` (Next's single middleware: route guards, login redirects) + `lib/session.ts` |
| `config/` | `lib/db.ts`; env checks live next to their one caller (e.g. `AUTH_SECRET` in `session.ts`) |
| `pages/` thin, no fetching | `app/**/page.tsx` imports only from `features/*` and `components/*`, never from `lib/db` |

### What the move changes

In small commits, each one type-checks and builds:
1. **Delete the dead files** from §4 (the endpoint deletions only with your OK).
2. **Create `components/layout` and `components/ui`**, and move the chrome and primitives into them.
3. **Create the features**, one commit per feature: move its single-use components, move its queries out of pages into `server.ts`, and move each handler's logic into the feature's `server.ts`.
4. **Merge the safe duplicates** from §3 (the rows marked **Yes**).
5. **Move the docs** into `docs/`, merge SETUP into `docs/CONTRIBUTING.md`, rename DEPLOY to `docs/DEPLOYMENT.md`, and write stubs for the rest.
6. **Set up `claude/`**, `CHANGELOG.md` (Keep a Changelog, starting at `0.1.0` = today's production), `docs/releases/0.1.0.md`, and the version in the footer.
7. **Add the Conventional Commits hook** (`.githooks/commit-msg`, enabled by a `prepare` script) and CI.

### CI checks that fail the build

All in one `ci.yml`: `tsc`, `eslint`, `node scripts/check-structure.mjs`, and the tests once Phase 3 adds them.

| Check | How | Why this way |
|---|---|---|
| **Pages don't touch the database** | ESLint `no-restricted-imports`: `app/**` may not import `@/lib/db` | Built into ESLint, no new dependency |
| **Shared doesn't depend on features** | ESLint `no-restricted-imports`: `components/**` may not import `@/features/**` or `@/lib/db` | Same |
| **Features stay decoupled** | Script: `features/A` may import only `features/B/server.ts` or `schemas.ts`, never B's components | ESLint can't express "a different feature" |
| **No route without a validator** | Script: every `route.ts` whose handlers read a body or params must import from a `schemas.ts` | Same |
| **File length** | ESLint `max-lines: 300` | An exemption is a visible `eslint-disable` comment at the top of the file |
| **No design literals** | ESLint `no-restricted-syntax` on class-name strings containing raw palette colours (`bg-emerald-100`), arbitrary values (`text-[10px]`) or hex codes | Today there are **1,109** raw palette classes in 55 files, plus 46 arbitrary values |

The design-literal rule is where I'm deliberately cutting a corner. Rewriting all 1,109 uses to tokens *without* changing a single colour is pure churn, because Phase 4 redesigns those same components anyway. So:
- `tokens.ts` goes in now and feeds `tailwind.config.ts`.
- The rule fails on any **new** literal.
- The 55 existing files sit on a named baseline list inside the check.
- Each file comes off the list as Phase 4 redesigns it, and the check fails if a listed file is already clean, so the list can only shrink.

### Flagged, not moved: these would change behaviour

1. **Landing page mock data** (`lib/mock-data.ts`, `commission-card.tsx`, `category-card.tsx`). It's fake, but deleting it changes the home page → Phase 2 fix.
2. **Colour maps that differ** (`CAT_PILL`, `STATUS_PILL`, the my-listings table) → Phase 4.
3. **The `timeAgo` variants.** The output text differs, so I'll leave two named functions in `lib/format.ts` rather than force one.
4. **The auto-flag copies.** One skips the notification → Phase 2, as a bug fix.
5. **The `frontend/` + `backend/` split.** See [Stack correction](#stack-correction).

### Before I start, I need answers on:

1. **Order.** The forgeable session cookie is live in production now, and you've already approved that fix. I recommend shipping it first as a small change to `lib/session.ts` plus a new `middleware.ts`, then doing the restructure, then resuming the Phase 2 audit, so later fixes land in their final locations. OK?
2. **Delete `POST /api/ratings` and `GET /api/saved`?** Nothing in the app calls either. I recommend yes.
3. **Version source.** The footer can read `version` from `package.json` (one source of truth, bumped by `npm version`) instead of a separate `version.json` that would drift. OK to skip `version.json`?
4. **Validators.** I recommend **zod**, one new dependency. Hand-writing validation for 30+ endpoints is more code than the library. OK?
5. **Traces of Claude in the repo.** You asked for commits with no trace of Claude. `claude/` and `claude/prompts/` (your prompts, verbatim) make that involvement visible in the repo itself. Commit them anyway, or keep `claude/` out of git?
6. **Where the original deliverables go.** I'd put:
   - `ARCHITECTURE.md` → `docs/`
   - the Phase 2 `AUDIT.md` → `claude/audits/`
   - `DECISIONS.md` → numbered ADRs in `claude/decisions/`
   - `CHANGES.md` → `claude/reports/`

   OK?
