# Security

## Reporting a vulnerability

Don't open a public issue. Contact the repository owner directly with the steps to reproduce.

## How the app protects itself

| Area | Mechanism |
|---|---|
| Sessions | HMAC-signed cookie (`AUTH_SECRET`), httpOnly, `SameSite=Lax`, `Secure` in production, 7 days. The user is re-loaded from the database on every request, so bans apply immediately |
| Passwords | bcrypt, cost 10; minimum 8 characters |
| MFA | TOTP (RFC 6238, ±30 s window) and one-time backup codes |
| Authorization | Checked inside feature services (`src/features/*/server.ts`), not in pages or routes. Admin pages also guard themselves with `pageSession({ admin: true })` |
| Registration | `@carsu.edu.ph` email only; self-registration can't create admins |
| Uploads | Type allow-list and size limits per upload kind; stored on Vercel Blob with unguessable URLs |
| Audit | Logins, MFA changes, moderation and report actions are written to `AuditLog` |

## Secrets

- `.env` is git-ignored.
- `AUTH_SECRET` and `DATABASE_URL` live only in the Vercel environment.
- **Known:** the seed script's admin password is committed. Change it after seeding any shared database.

## Open findings

The current audit, with fix status, is in `claude/audits/`.
