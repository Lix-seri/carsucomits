# CarsuComits — Production Deployment Guide

How to take your local project public on the internet using **Vercel** (hosting), **Neon** (Postgres database), and **Vercel Blob** (avatar image storage). All three have free tiers that comfortably fit a thesis project.

> **Time estimate:** ~30 minutes the first time. ~1 minute on every subsequent deploy (just `git push`).

---

## Table of Contents

- [What you'll have at the end](#what-youll-have-at-the-end)
- [Prerequisites](#prerequisites)
- [Step 1 — Create the Neon Postgres database](#step-1--create-the-neon-postgres-database)
- [Step 2 — Update your local `.env`](#step-2--update-your-local-env)
- [Step 3 — Push the schema to Neon and seed the admin](#step-3--push-the-schema-to-neon-and-seed-the-admin)
- [Step 4 — Verify it works locally](#step-4--verify-it-works-locally)
- [Step 5 — Push the code to GitHub](#step-5--push-the-code-to-github)
- [Step 6 — Sign up for Vercel and import the repo](#step-6--sign-up-for-vercel-and-import-the-repo)
- [Step 7 — Add Vercel Blob storage](#step-7--add-vercel-blob-storage)
- [Step 8 — Deploy](#step-8--deploy)
- [Step 9 — Re-seed the production database](#step-9--re-seed-the-production-database)
- [Day-to-day deploy workflow](#day-to-day-deploy-workflow)
- [Common errors](#common-errors)

---

## What you'll have at the end

- A live URL like `https://carsucomits-svllynx.vercel.app`
- Real Postgres database hosted on Neon, accessible from both your laptop and Vercel
- Avatar uploads stored on Vercel Blob (CDN-served images)
- Auto-deploy on every `git push` to `main`
- HTTPS, custom domain support, global CDN — all free

---

## Prerequisites

- A working local app (you can run `npm run dev` and the site loads)
- Your code pushed to GitHub (we already did this)
- A GitHub account (you have `svllynx`)

---

## Step 1 — Create the Neon Postgres database

1. Open **https://neon.tech/** in your browser.
2. Click **Sign up** → choose **Continue with GitHub** (easiest — no extra password).
3. Authorize Neon to access your GitHub.
4. On the welcome screen, fill in:
   - **Project name:** `carsucomits`
   - **Database name:** `carsucomits` (or just `neondb`, doesn't matter)
   - **Region:** pick **Singapore** or **Hong Kong** (closest to the Philippines)
5. Click **Create project**.

After ~5 seconds, you'll see a connection string like:
```
postgresql://neondb_owner:abc123XYZ@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

> **Copy this string somewhere safe.** It contains your database password. You'll need it in Step 2 and Step 6.

Neon's free tier gives you:
- 0.5 GB of storage (huge for our use case)
- Unlimited DB branches
- Automatic backups
- Sleeps after 5 min of inactivity, wakes in <1 sec

---

## Step 2 — Update your local `.env`

Open `c:\Users\Administrator\CLAUDE\CARSUCOMITS\app\.env` in your editor.

Replace the existing `DATABASE_URL` with the Neon connection string from Step 1:

```env
DATABASE_URL="postgresql://neondb_owner:abc123XYZ@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

AUTH_SECRET="any-long-random-string-32-chars-or-more"
```

Leave `BLOB_READ_WRITE_TOKEN` unset for now — it's only needed when testing avatar uploads locally, and we'll get it from Vercel later.

Save the file.

---

## Step 3 — Push the schema to Neon and seed the admin

In a terminal, from the `app/` folder:

```bash
npm install
```

This fetches the new `@vercel/blob` package along with everything else.

```bash
npm run db:push
```

Prisma reads `schema.prisma`, connects to Neon, and creates all the tables. Output looks like:
```
Your database is now in sync with your Prisma schema. Done in 4.21s
```

```bash
npm run db:seed
```

Creates the admin account in Neon. Output:
```
OK  Created admin account "glen.licayan@carsu.edu.ph".
```

---

## Step 4 — Verify it works locally

```bash
npm run dev
```

Open `http://localhost:3000`:
- Login with `glen.licayan@carsu.edu.ph` / `123456` on the **Admin** tab → admin panel loads
- Register a new student account → it persists (now stored in Neon, not local SQLite)
- Post a commission, apply, message — everything still works

> 🎉 If this all works, your code is production-ready. The same Neon database will be used by your local dev AND your Vercel deployment.

---

## Step 5 — Push the code to GitHub

```bash
git add .
git commit -m "Migrate to Postgres + Vercel Blob for production deployment"
git push origin main
```

---

## Step 6 — Sign up for Vercel and import the repo

1. Open **https://vercel.com/signup**.
2. Click **Continue with GitHub**.
3. Authorize Vercel.
4. After signup, click **Add New…** → **Project**.
5. Vercel shows your GitHub repos. Find `carsucomits` → click **Import**.
6. **Configure project:**
   - **Project Name:** `carsucomits` (or whatever you like — this becomes part of the URL)
   - **Framework Preset:** auto-detected as **Next.js** ✓
   - **Root Directory:** click **Edit** → set to `app` (your code lives in the `app/` subfolder)
   - **Build Command:** leave default (Vercel runs `npm run build` which now includes `prisma generate`)
   - **Install Command:** leave default
7. Expand **Environment Variables** and add:
   - **Name:** `DATABASE_URL`
   - **Value:** the same Neon connection string from Step 1 (paste it in)
   - Click **Add**.
   - Add another:
   - **Name:** `AUTH_SECRET`
   - **Value:** any long random string (use the same one from your local `.env`)
   - Click **Add**.

> Don't add `BLOB_READ_WRITE_TOKEN` yet — Vercel will inject it automatically in the next step.

8. Click **Deploy**.

Vercel starts building. You'll see logs scrolling. After ~2 minutes you'll see "🎉 Your project has been deployed."

**Don't visit the URL yet** — avatar uploads will fail because we haven't connected Blob storage. Do Step 7 first.

---

## Step 7 — Add Vercel Blob storage

1. From the project dashboard, click the **Storage** tab at the top.
2. Click **Create Database** → choose **Blob**.
3. Give it a name like `carsucomits-blob`.
4. Click **Create**.
5. Vercel automatically:
   - Creates the Blob store
   - Generates a `BLOB_READ_WRITE_TOKEN`
   - Adds it as an env variable to your project
6. After it finishes, click the **Deployments** tab → click **…** on the latest deployment → **Redeploy** to pick up the new env var.

Wait ~1 minute for the redeploy to finish.

---

## Step 8 — Deploy

It's already deployed! Click the project name at the top to go back to the overview, then click **Visit** (or copy the URL like `https://carsucomits-svllynx.vercel.app`).

You should see your real CarsuComits landing page running on Vercel's servers, served from a global CDN.

---

## Step 9 — Re-seed the production database

If you used the same Neon DB for local dev (recommended in Step 2), the admin account already exists in production — skip this step.

If you used a separate prod DB, in your terminal point your local `.env` at the prod DB string and run:

```bash
npm run db:seed
```

---

## Day-to-day deploy workflow

After this initial setup, deploying changes is **one command**:

```bash
git push
```

That's it. Vercel watches your `main` branch on GitHub. Every push triggers an auto-build and deploy. You'll get an email when it's done.

To preview changes before merging to `main`:
```bash
git checkout -b feature/my-change
# ...edit code...
git push -u origin feature/my-change
```

Vercel auto-creates a preview URL for the branch — share it with your group before merging.

---

## Common errors

### Build fails on Vercel: "PrismaClientInitializationError"

The build can't connect to your Neon DB. Causes:
- `DATABASE_URL` env var missing or wrong → re-check in Vercel project settings
- Connection string doesn't include `?sslmode=require` → add it
- Neon project is paused → visit Neon dashboard, click any query to wake it

### Build fails: "Cannot find module '@vercel/blob'"

Run `npm install` locally and commit the updated `package-lock.json`:
```bash
npm install
git add package-lock.json
git commit -m "Update lockfile"
git push
```

### Avatar upload returns 500 in production

`BLOB_READ_WRITE_TOKEN` isn't set. Did you redeploy after creating the Blob store (end of Step 7)? In the Vercel dashboard:
- **Settings** → **Environment Variables** → confirm `BLOB_READ_WRITE_TOKEN` exists
- If it doesn't, recreate the Blob store from the **Storage** tab

### Local dev now says "Can't reach database server"

Your `.env` is missing or has a stale `DATABASE_URL`. Fix:
```bash
cd c:\Users\Administrator\CLAUDE\CARSUCOMITS\app
# open .env, paste your Neon connection string in DATABASE_URL=
```

### Login after deploy says "Invalid credentials"

The production DB was never seeded. Run the seed against the prod DB:
- Make sure your local `.env` has the prod `DATABASE_URL`
- Run `npm run db:seed`

### Search results are empty even though data exists

Postgres is case-sensitive by default. Already fixed — all `contains` queries use `mode: "insensitive"`. If you add new search queries later, remember this.

---

## Resource summary

| Service | Purpose | Free tier limit |
|---|---|---|
| **Vercel** | Hosting + auto-deploy | 100 GB bandwidth/mo, unlimited deploys |
| **Neon** | Postgres database | 0.5 GB storage, sleeps when idle |
| **Vercel Blob** | Avatar image storage | 1 GB storage, 1 GB bandwidth/mo |
| **GitHub** | Source code + version control | Unlimited private repos |

Total monthly cost: **₱0**. Well within your charter's ₱1,500 budget.

---

## Getting help

If something breaks:
1. Check the Vercel **Deployments** tab → click the failing deploy → **Build Logs** show exactly what went wrong
2. Check the **Runtime Logs** tab (or **Functions** → click a function) for runtime errors after deploy
3. Neon's dashboard → **Monitoring** shows DB connection counts and slow queries

Last updated: 2026-05-09.
