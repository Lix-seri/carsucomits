# CarsuComits — Setup Guide

Step-by-step instructions to run the project on a new computer (laptop, desktop, or a teammate's machine).

> **TL;DR** — install Node, Git, VS Code, then paste the [one-shot block](#one-shot-setup-copypaste).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [One-Shot Setup (copy-paste)](#one-shot-setup-copypaste)
- [Step-by-Step Setup](#step-by-step-setup)
- [Daily Workflow Across Multiple Computers](#daily-workflow-across-multiple-computers)
- [What's NOT Synced via GitHub](#whats-not-synced-via-github)
- [Default Admin Login](#default-admin-login)
- [Sharing with Group Members](#sharing-with-group-members)
- [Common Gotchas](#common-gotchas)

---

## Prerequisites

Install these once on each computer:

| Tool | Where to get it | Why |
|---|---|---|
| **Node.js 20 LTS** | https://nodejs.org/ | Runs the Next.js app |
| **Git** | https://git-scm.com/download/win | Clones and syncs the repo |
| **VS Code** *(or any editor)* | https://code.visualstudio.com/ | Edits the code |

After installing, **close and reopen your terminal** so the new tools are detected.

Verify the installs:

```bash
node --version
```
Expected: `v20.x.x` or higher.

```bash
git --version
```
Expected: `git version 2.x.x` or higher.

If either says **"not recognized"**, restart your computer and try again — the system PATH needs a refresh.

---

## One-Shot Setup (copy-paste)

After Node, Git, and VS Code are installed, paste this entire block into Command Prompt:

```bash
git config --global user.name "svllynx"
git config --global user.email "jeffersonsevillano2004@gmail.com"
cd %USERPROFILE%\Documents
git clone https://github.com/svllynx/carsucomits.git
cd carsucomits\app
npm install
copy .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

When `npm run dev` finishes, open **http://localhost:3000** in your browser.

> Replace the name and email above with your own if you're setting up on a teammate's account.

---

## Step-by-Step Setup

If you'd rather run the commands one at a time:

### 1. Configure git (one-time per machine)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Use the same name and email across all your computers so commits stay consistent.

### 2. Pick a folder for the project

Anywhere works. Common choices: `Documents`, `Desktop`, or a dedicated `code` folder.

```bash
cd %USERPROFILE%\Documents
```

### 3. Clone the repo

```bash
git clone https://github.com/svllynx/carsucomits.git
```

A browser window may open asking you to sign in to GitHub — sign in, click Authorize, close the tab.

A new folder named `carsucomits` is created with all the project code inside.

### 4. Move into the app folder

```bash
cd carsucomits\app
```

Note: the source lives in the `app` subfolder, not the repo root.

### 5. Install dependencies

```bash
npm install
```

Takes 1–2 minutes. Downloads ~300 MB of packages into `node_modules/`. Wait until you see something like:

```
added 412 packages in 1m 22s
```

### 6. Create the `.env` file

```bash
copy .env.example .env
```

The cloned repo intentionally does not include `.env` (it's in `.gitignore`). This step copies the example file with safe defaults.

### 7. Create the local database

```bash
npm run db:push
```

Expected output:

```
SQLite database dev.db created at file:./dev.db
Your database is now in sync with your Prisma schema. Done in 0.55s
```

### 8. Seed the admin account

```bash
npm run db:seed
```

Expected output:

```
OK  Created admin account "glen.licayan@carsu.edu.ph".

    Login on the Admin tab with:
      Email:    glen.licayan@carsu.edu.ph
      Password: 123456
```

### 9. Run the dev server

```bash
npm run dev
```

Wait ~5 seconds. You should see:

```
▲ Next.js 15.0.3
- Local:    http://localhost:3000
✓ Ready in 2.1s
```

### 10. Open the site

Visit **http://localhost:3000** in your browser. The CarsuComits landing page should load.

To stop the server: press **Ctrl + C** in the terminal where it's running.

---

## Daily Workflow Across Multiple Computers

After the initial setup is done on each computer, you keep them in sync through GitHub.

### Before you start coding (any session, any computer)

```bash
cd %USERPROFILE%\Documents\carsucomits
git pull
```

This downloads any changes you (or teammates) pushed from another machine.

**Always pull first.** Skipping this step is the #1 cause of merge conflicts.

### While coding

Business as usual. Edit files in your editor. Run the dev server:

```bash
cd app
npm run dev
```

### When you finish a coding session

Save your work to GitHub so you can pick it up on the other computer:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

The next time you open the other computer, `git pull` brings these changes down.

### Quick reference

| Goal | Command |
|---|---|
| Start working | `git pull` |
| See what you changed | `git status` |
| Save your changes | `git add . && git commit -m "..." && git push` |
| Throw away uncommitted changes | `git checkout .` (be careful — destructive) |
| See past commits | `git log --oneline` |

---

## What's NOT Synced via GitHub

These stay separate per computer — that's intentional, not a bug:

| File / Folder | Reason | What to do on a new computer |
|---|---|---|
| `node_modules/` | Too large, regenerates from `package.json` | Run `npm install` |
| `.env` | May hold secrets — never goes to GitHub | Run `copy .env.example .env` |
| `prisma/dev.db` | Each machine has its own database | Run `npm run db:push && npm run db:seed` |
| `public/avatars/*` | User-uploaded photos | Re-upload via the app as needed |
| `.next/` | Build cache, regenerates automatically | Nothing — `npm run dev` rebuilds it |

Source code, configs, README, and migrations all sync via GitHub.

---

## Default Admin Login

After running `npm run db:seed`, you can sign in with:

- **Email:** `glen.licayan@carsu.edu.ph`
- **Password:** `123456`
- Use the **Admin** tab on the login screen.

To register a regular **student** account, click **Register** on the login page and use any `@carsu.edu.ph` email.

---

## Sharing with Group Members

Since the repo is **Public**, group members can clone directly without any access setup. Send them this:

> 1. Install Node.js 20 LTS, Git, and VS Code (links above).
> 2. Open a terminal and run:
>    ```bash
>    git clone https://github.com/svllynx/carsucomits.git
>    cd carsucomits/app
>    npm install
>    copy .env.example .env
>    npm run db:push
>    npm run db:seed
>    npm run dev
>    ```
> 3. Open `http://localhost:3000`.

### If you switch the repo to Private later

You'll need to add teammates as Collaborators:

1. GitHub repo → **Settings** → **Collaborators**
2. Click **Add people**
3. Type their GitHub username → send invite
4. They accept the invite via email → can now clone, edit, and push.

---

## Common Gotchas

### `git push` rejected — "fetch first" or "non-fast-forward"

Someone else pushed before you. Pull their changes, then push yours:

```bash
git pull --rebase
git push
```

### Two computers edited the same file

Git pauses and shows a merge conflict. Open the conflicting file in your editor — you'll see markers like:

```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> origin/main
```

Pick which version to keep (or merge them by hand), delete the marker lines, then:

```bash
git add .
git rebase --continue
git push
```

### `npm run dev` shows "Module not found"

You skipped or didn't finish `npm install`. Run it:

```bash
npm install
```

### Login says "Invalid credentials"

The admin account doesn't exist in this computer's database. Run:

```bash
npm run db:seed
```

### Site loads but looks unstyled (no green/colors)

Tailwind didn't compile. Stop the dev server (Ctrl+C), clear the cache, and restart:

```bash
rmdir /s /q .next
npm run dev
```

### "remote origin already exists"

Your remote URL is set to the wrong repo. Overwrite it:

```bash
git remote set-url origin https://github.com/svllynx/carsucomits.git
```

### Git keeps asking for password

GitHub no longer accepts passwords as of 2021. Either:
- Let the browser-based credential manager handle it (the popup that opens on first push), or
- Generate a Personal Access Token at https://github.com/settings/tokens and paste it instead of your password.

### `dev.db` looks different between machines

That's expected. Each computer has its own SQLite file with its own users, reports, and avatars. The schema is shared (synced via `prisma/schema.prisma`), but the data isn't.

If you want to copy DB contents between machines:

1. Stop the dev server on both.
2. Send `app/prisma/dev.db` from one machine to the other (Discord, Drive, USB).
3. On the destination machine, replace the existing `dev.db`.
4. Restart `npm run dev`.

---

## Stopping and Removing the Project

To stop the dev server: **Ctrl + C** in the terminal where it's running.

To delete the project from a computer entirely:

```bash
cd %USERPROFILE%\Documents
rmdir /s /q carsucomits
```

This only deletes the local copy. Your GitHub repo and other computers' copies are untouched.

---

## Need Help?

- **Issues with this project specifically** — open an issue on the GitHub repo.
- **Issues with Node / Git / Windows** — paste the error message into Google or ChatGPT; these are well-documented.

Last updated: 2026-05-06.
