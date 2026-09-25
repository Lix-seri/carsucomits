# claude/ — the human-readable record

This folder is for **people**. It records the AI-assisted work on this repository so that anyone, including a new Claude session, can see what was asked, what was found, what was decided and what was done.

| Folder | Contents |
|---|---|
| `context/PROJECT.md` | Orientation for someone starting cold. **Read this first** |
| `prompts/` | Every instruction the owner gave, verbatim, numbered and dated |
| `audits/` | Security, QA, structure, design and accessibility runs, named `<KIND>_<date>.md` |
| `decisions/` | One ADR per architectural decision, numbered |
| `reports/` | End-of-batch reports: what was built, what's left, test counts |

## Not the same as `.claude/`

`.claude/` (with the dot) is **machine configuration** for Claude Code: settings, skills and agent definitions that change how the tool behaves. It holds no history and isn't meant to be read as documentation.

`claude/` (no dot) is **documentation**. Nothing in it changes how any tool behaves.

Keep them separate: don't put settings here, and don't put notes there.
