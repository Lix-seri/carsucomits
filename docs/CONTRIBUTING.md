# Contributing

## Run it locally

You need Node.js 20 or newer, and Git. You **don't** need a Neon account: the repo ships a local Postgres.

```bash
git clone https://github.com/Lix-seri/carsucomits.git
cd carsucomits            # the repo root is the app; there is no app/ subfolder
npm install               # also installs the commit-message hook
cp .env.example .env      # then set AUTH_SECRET (see the comment in the file)
```

In `.env`, point the app at the local database:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/carsucomits"
AUTH_SECRET="any-random-string-of-at-least-32-characters"
```

Then, in two terminals:

```bash
npm run db:local          # terminal 1: starts Postgres on port 5433 (data in .data/pg), keep it running
```

```bash
npx prisma migrate deploy # terminal 2: create the tables
npm run db:seed           # create the admin account
npm run dev               # http://localhost:3000
```

**Admin account** (Admin tab on `/login`): `glen.licayan@carsu.edu.ph`.
- Set `SEED_ADMIN_PASSWORD` (12+ characters) in `.env` before seeding.
- If you don't, the seed generates a password and prints it once.
- To change the password later, set `SEED_ADMIN_PASSWORD` and run `npm run db:seed` again.
- The seed never resets an existing admin's password otherwise.

**Uploads** (avatars, covers, deliverables) need `BLOB_READ_WRITE_TOKEN` from the Vercel project. Without it, everything else works and uploads return an error.

**Using Neon instead** of the local database: put the Neon connection string in `DATABASE_URL` and skip `npm run db:local`.

## Tests

| Command | What it runs |
|---|---|
| `npm test` | Unit tests (`src/**/*.test.ts`, Node's built-in runner) |
| `npm run test:e2e` | Builds the app, resets the `carsucomits_test` database, runs Playwright on desktop + mobile. Needs `npm run db:local` running. Screenshots land in `test-results/screens/` |
| `npm run check` | Type-check, lint, and the structure check. What CI runs before the tests |

## Where code goes

Read [ARCHITECTURE.md](ARCHITECTURE.md#rules) first. The short version:

- New behaviour goes in `src/features/<domain>/server.ts`, **including the permission check**.
- A route handler only reads the request, validates it, and calls one service.
- A page only calls services and renders components; it never imports `@/lib/db`.
- A component used by one feature lives in that feature.

CI fails the build if these are broken.

## Commits

- Commit directly to `main` in small, single-purpose commits.
- Messages follow [Conventional Commits](https://www.conventionalcommits.org/), and the `commit-msg` hook rejects anything else:
  ```
  feat(applications): cap concurrent applications per user
  fix(auth): sign session cookie
  docs: add data model
  ```
  Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `style`, `revert`.
- Every batch of work adds an entry under `[Unreleased]` in `CHANGELOG.md`.

## Releasing

1. `npm version minor` (or `patch` / `major`) bumps `package.json`. The footer reads the version from there.
2. Move the `[Unreleased]` notes in `CHANGELOG.md` under the new version.
3. Add `docs/releases/<version>.md`.
4. Commit as `chore(release): <version>`.
