# 0001 — Signed cookie session with a database re-check

- **Date:** 2026-09-25 · **Status:** Accepted, implemented (`5174b12`)

**Context.** The session cookie was `base64(JSON)` with no signature, so anyone could forge a session for any user, including the admin. It also carried the role and name, and was never re-checked, so bans took up to 7 days to bite.

**Decision.** The cookie now carries only `{ uid, role, exp }` plus an HMAC-SHA256 signature keyed by `AUTH_SECRET` (32+ characters). `getSession()` verifies the signature, then re-loads the user from the database on every request. Banned and suspended users get `null`. No library was added; Web Crypto does the HMAC.

**Consequences.**
- Every existing session was invalidated once.
- `AUTH_SECRET` is now required: without it nobody can sign in, but public pages still render.
- There is one extra indexed lookup per request, cached per request with React `cache()`.
