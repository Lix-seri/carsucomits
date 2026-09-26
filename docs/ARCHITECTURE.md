# Architecture

CarSUComits is a commission marketplace for Caraga State University – Main Campus students. A user posts a paid task (a *commission*), others apply, the poster hires one, work is delivered and reviewed, and both sides rate each other.

- **Data model:** [DATA_MODEL.md](DATA_MODEL.md)
- **Endpoints:** [API.md](API.md)
- **Why things are the way they are:** `claude/decisions/`
- **Known issues:** `claude/audits/`

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 15 App Router, React 19, TypeScript (strict). One deployable: pages and API route handlers live together |
| Styling | Tailwind CSS 3; component classes in `src/app/globals.css` |
| Database | PostgreSQL via Prisma 5 (Neon in production, embedded Postgres locally and in tests) |
| Files | Vercel Blob (`@vercel/blob`) for avatars, cover images and deliverables |
| Auth | Signed cookie session (`src/lib/session.ts`), bcrypt passwords, optional TOTP MFA |
| Tests | `node:test` + `tsx` for unit tests (`*.test.ts` next to the code), Playwright for end-to-end tests (`e2e/`) |

## Structure

```
src/
├── app/                     # ROUTES ONLY (Next.js convention)
│   ├── **/page.tsx          #   compose: call feature services, render feature components
│   ├── **/layout.tsx        #   chrome + page guards
│   └── api/**/route.ts      #   parse input → requireSession() → call a feature service → JSON
├── features/<domain>/       # one folder per domain, flat
│   ├── server.ts            #   business rules AND permission checks; the only place that queries the DB
│   └── *.tsx                #   components used only by this domain
├── components/
│   ├── layout/              # site header/footer, dashboard + admin chrome, logo, logout, back
│   └── ui/                  # shared primitives: Avatar, Kpi, Stat
└── lib/                     # infrastructure: db, session, http, format, labels, utils
e2e/                         # Playwright specs + helpers
prisma/                      # schema.prisma, seed.mjs
scripts/                     # local-db.mjs (embedded Postgres)
docs/                        # this folder
claude/                      # human-readable record: prompts, audits, decisions, reports
```

### Features

| Feature | Owns |
|---|---|
| `auth` | login, register, MFA (setup/enable/disable), login and register forms |
| `commissions` | browse listing, create, cover image, bookmarks, detail-page data, my listings, post form |
| `applications` | apply, accept, decline, withdraw, applicant lists |
| `deliverables` | upload, approve / request revision, the job-workspace section |
| `ratings` | complete-with-rating, retroactive rating, rating the commissioner, low-rating auto-flag, trust tiers, rating dialogs |
| `hub` | read-only aggregations for `/dashboard`, `/hub`, `/hiring` |
| `messages` | threads, conversation, send; the messages view |
| `notifications` | `notify()`, list, mark read; the bell popover |
| `reports` | file a report, my reports, admin report actions |
| `profile` | stats, skills, avatar, public profile data |
| `admin` | moderation, admin dashboards, audit log view |
| `search` | topbar search |
| `landing` | home page content |

## Rules

These are enforced by checks in CI (see [Checks](#checks)), not just written down:

1. **Pages compose.**
   - A `page.tsx` calls feature services and renders components.
   - It never imports `@/lib/db`.
   - A client page's logic lives in a feature component.
2. **Routes are thin.** A `route.ts`:
   - reads the request;
   - authenticates with `requireSession()`;
   - validates with the feature's schema;
   - calls **one** service.

   `jsonRoute()` turns the return value into `{ ok: true, ... }` and an `HttpError` into `{ error }` with its status.
3. **Authorization lives in services.**
   - Every service that acts on someone's data takes the `Session` and checks ownership or role itself (`assertAdmin`, "only the commissioner who posted this…").
   - A new route can't forget the check, because the check isn't in the route.
4. **Pages guard themselves.** Next.js renders layouts and pages in parallel, so a redirect in a layout doesn't stop the page's code. Protected pages call `pageSession()`.
5. **Shared means shared.**
   - `components/` never imports from `features/`.
   - A component used by one feature lives in that feature.
   - Features import other features only through `server.ts`.
6. **Files stay under 300 lines.** Exceeding it needs a visible `eslint-disable max-lines` with a reason.
7. **Design values come from tokens.** Tailwind theme values in `tailwind.config.ts` / `src/styles/tokens.ts`. Raw palette classes and arbitrary values (`text-[10px]`) are banned in new code. Files that predate the rule are on a shrinking baseline list.
8. **Flat beats clever.**
   - No folders holding one file.
   - No re-export `index.ts` files.
   - No wrappers that only forward arguments.

## Request flow

```
browser ──fetch──▶ app/api/x/route.ts
                     │ requireSession()          401 if no valid signed cookie / banned / suspended
                     │ schema.parse(body)        400 on invalid input
                     ▼
                   features/x/server.ts
                     │ ownership / role check    403
                     │ business rules            400 / 404 / 409
                     │ prisma queries, notify(), audit log
                     ▼
                   { ok: true, ...result }
```

Server pages call the same services directly, with the session from `pageSession()` or `getSession()`.

## Roles and sessions

- **Roles:** `STUDENT_EMPLOYEE` (the default), `COMMISSIONER` and `ADMIN`.
  - Posting and applying aren't gated by role today: you're the commissioner of what you posted.
  - Admin is created only by `prisma/seed.mjs`.
- **Session cookie:** `carsu_session` = `base64url({uid, role, exp}).HMAC-SHA256(AUTH_SECRET)`, httpOnly, 7 days. `getSession()` verifies the signature and re-loads the user every request (cached per request). Banned and suspended users are signed out immediately.
- **MFA:** TOTP with backup codes, available to every account; the setup UI is at `/admin/security`.

## Commission lifecycle

```
OPEN ──accept──▶ IN_PROGRESS ──deliverable──▶ AWAITING_REVIEW
                     ▲  │                         │
                     │  └──complete + rating──▶ COMPLETED
                     └──── request revision ──────┘
```

`CANCELLED` and `DISPUTED` exist in the enum but nothing sets them yet.

## Checks

| Check | Tool |
|---|---|
| Types | `tsc --noEmit` |
| Lint, import boundaries, max 300 lines, no design literals | ESLint (`.eslintrc.json`) |
| Cross-feature imports, every body-reading route has a schema | `scripts/check-structure.mjs` |
| Unit tests | `npm test` |
| End-to-end, desktop + mobile | `npm run test:e2e` |
| Conventional Commits | `.githooks/commit-msg`, installed by `npm install` |

All of them run in `.github/workflows/ci.yml` on every push to `main`.

## Environment

See `.env.example`.

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | Required | |
| `AUTH_SECRET` | Required | 32+ characters |
| `BLOB_READ_WRITE_TOKEN` | Required for uploads | Injected automatically on Vercel |

Deployment is in [DEPLOYMENT.md](DEPLOYMENT.md).
