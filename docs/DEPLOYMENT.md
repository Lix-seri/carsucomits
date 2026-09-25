# Deployment

Production runs on **Vercel** (hosting), **Neon** (Postgres) and **Vercel Blob** (uploads). All three have free tiers.

> Pushes to this repository (`Lix-seri/carsucomits`) don't deploy on their own. Whoever owns the Vercel project must connect it to this repo, or pull these changes into the deployed repo.

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string, ending in `?sslmode=require` |
| `AUTH_SECRET` | Random string, 32+ characters: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. **Required**: without it nobody can sign in. Changing it signs everyone out |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when you create a Blob store under Vercel → Storage |

## First deployment

1. **Neon:** create a project (Singapore region is closest) and copy the pooled connection string.
2. **Vercel:** Add New → Project, and import the repo.
   - **Root directory:** the repo root (leave it empty).
   - **Framework:** Next.js.
   - **Build command:** the default, `npm run build`.
3. **Environment variables:** add the three above, then create the Blob store (Storage → Create → Blob) and redeploy.
4. **Admin account:** seed it once against the production database. From a machine whose `.env` points at production, run `npm run db:seed`. **Then change the password.** The seed password is public in this repo.

## Every deployment after that

- Pushing to the connected branch builds and deploys automatically.
- `npm run build` runs `prisma generate`, applies pending migrations (`prisma migrate deploy`), then `next build`.
- If a migration fails, the build fails and the previous deployment stays live.
- **Schema changes** are made locally with `npx prisma migrate dev --name <change>`, and the generated folder in `prisma/migrations/` is committed. Never use `prisma db push` against a shared database.

## Common errors

| Symptom | Cause |
|---|---|
| Nobody can log in; logs say `AUTH_SECRET is missing` | Set `AUTH_SECRET` (32+ characters) and redeploy |
| Build fails at `prisma migrate deploy` | `DATABASE_URL` is wrong, the database is paused, or a migration conflicts with manual changes. The build log names the migration |
| Uploads return 500 | `BLOB_READ_WRITE_TOKEN` is missing. Create the Blob store and redeploy |
| Search finds nothing that exists | All `contains` queries must use `mode: "insensitive"` (Postgres is case-sensitive) |
