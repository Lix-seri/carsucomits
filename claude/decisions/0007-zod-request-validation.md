# 0007 — zod for request validation

- **Date:** 2026-09-25 · **Status:** Accepted (applied endpoint by endpoint from Phase 2)

**Decision.** Each feature has a `schemas.ts` with one zod schema per endpoint. Services receive parsed, typed input; `jsonRoute` turns a `ZodError` into a 400 with the first issue's message. CI fails if a route that reads a body or params doesn't import a schema.

**Why.** It's one dependency. Hand-validating 30+ endpoints was the source of several 500s, such as `Number("abc")` reaching Prisma.
