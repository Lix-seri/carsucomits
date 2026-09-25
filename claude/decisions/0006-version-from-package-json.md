# 0006 — The running version comes from package.json

- **Date:** 2026-09-25 · **Status:** Accepted

**Decision.** The footer reads `version` from `package.json`. There is no separate `version.json`. `npm version <patch|minor|major>` bumps it, and CHANGELOG.md plus `docs/releases/<version>.md` are written in the same commit.

**Why.** Two files holding the version would drift apart.
