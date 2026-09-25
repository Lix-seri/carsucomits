# 0008 — The claude/ record is committed

- **Date:** 2026-09-25 · **Status:** Accepted

**Decision.** `claude/` is committed to the repo: prompts verbatim, audits, decisions, and reports. Commits themselves carry no Claude attribution (owner's instruction).

**Split.**
- `claude/` is the record a person reads.
- `.claude/` is Claude Code's machine configuration: skills, agents, settings. It isn't created until there is something to put in it.

The two must not be merged.
