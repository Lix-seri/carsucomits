# 0002 — Prisma Migrate, applied during the build

- **Date:** 2026-09-25 · **Status:** Accepted (implemented with the first schema change in Phase 2)

**Context.** The schema reached Neon through a manual `prisma db push`, with no history. A push that changed the schema broke the live site until someone ran `db push` by hand.

**Decision.**
- Switch to Prisma Migrate with a baseline migration equal to the current schema.
- The build runs `prisma migrate deploy` before `next build`, so code and schema ship together.
- An existing database that was created with `db push` is marked as baselined once, automatically.

**Consequences.**
- A failing migration fails the build, and the previous deployment stays live.
- Schema changes must be made with `prisma migrate dev`, never `db push`, against shared databases.
