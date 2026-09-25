# 0002 — 2026-09-25 — Repository architecture setup

Verbatim.

---

Repository architecture setup. This is structural only — no features, no visual changes, no behaviour changes. If a move would change behaviour, stop and flag it rather than making it.

Stack: Vite + React + TypeScript + Tailwind (frontend), Node + Express + TypeScript (backend). Adjust the shape if my stack differs, but keep the principles.

## 0. Audit first — do not move anything yet
Produce `claude/audits/STRUCTURE_<date>.md`:
- Current tree with file and line counts per folder.
- Every file sitting in the wrong place, and where it belongs.
- Duplicates and near-duplicates — the same helper written twice, two components doing one job.
- Dead files: no importers, no route, no test.
- Circular imports.
- Import depth — anywhere reaching `../../../` is a structural smell. List them all.
- Files over ~300 lines that are doing more than one job.

Then recommend **type-first or feature-first** based on what you actually found, not on preference. Type-first (all components together, all services together) suits smaller apps. Feature-first (`features/<domain>/` holding its own components, hooks, and services) suits apps where one change touches several folders. Say which fits and why, with the file counts behind the recommendation.

Stop. I approve the plan before you move a single file.

## 1. Root layout
```
repo/
├── frontend/
├── backend/
├── shared/          # types shared by both, if any — do not create this empty
├── docs/
├── claude/          # human-readable Claude record
├── .claude/         # Claude Code config: skills, agents, settings
├── .github/workflows/
├── CHANGELOG.md
├── README.md
└── .gitignore
```

## 2. Frontend
```
frontend/src/
├── components/      # shared across features only
│   ├── ui/          # primitives: Button, Input, Card
│   └── layout/      # Header, Footer, Shell
├── features/        # if feature-first
│   └── <domain>/    # components, hooks, services, types for that domain
├── pages/           # route-level, thin — composition only, no business logic
├── hooks/           # shared hooks only
├── context/
├── services/        # API layer, one module per resource
├── utils/
├── types/
├── assets/{images,fonts,videos}
├── styles/          # tokens.ts is the single source of design values
├── App.tsx
└── main.tsx
```
Rules:
- Pages compose; they never hold business logic or fetch directly.
- A component used by one feature lives with that feature, not in shared.
- Every design value — colour, spacing, radius, type size, motion duration — comes from tokens.ts. No literals in components.

## 3. Backend
```
backend/src/
├── config/          # env validation, db connection, constants
├── routes/          # definitions only
├── controllers/     # thin: parse, call service, format response
├── services/        # all business logic and authorization
├── models/
├── middlewares/     # auth, error, validation, rate limit
├── validators/      # schema per endpoint
├── utils/
├── types/
├── app.ts
└── server.ts
```
Rules:
- Controllers stay thin. Logic lives in services.
- **Authorization lives in services, not controllers.** A route reachable without its service checking permission is a hole.
- Every endpoint has a validator. No unvalidated input reaches a query.
- No file reaches into another layer's internals.

## 4. claude/ — the human-readable record
```
claude/
├── README.md              # what this folder is, and how it differs from .claude/
├── context/PROJECT.md     # the orientation doc a future session reads first
├── prompts/               # every prompt I give you, verbatim, dated and numbered
├── reports/               # end-of-batch reports
├── decisions/             # one ADR per architectural decision, numbered
└── audits/                # security, design, accessibility, performance runs
```
`.claude/` holds machine configuration — skills, agents, settings. `claude/` holds the record a person reads. Explain the split in both READMEs so nobody merges them.

`PROJECT.md` must be enough for a session starting cold: what this is, the stack, the structure, the standing rules, what is built, what is blocked and on whom.

## 5. Docs and versioning, set up now
`docs/`: ARCHITECTURE.md, API.md, DATA_MODEL.md, CONTRIBUTING.md, DEPLOYMENT.md, SECURITY.md, ROADMAP.md — as stubs with headings if empty.

Semantic versioning, CHANGELOG.md in Keep a Changelog format maintained every batch, `docs/releases/` one file per release, and a `version.json` the frontend reads so the footer shows the running version. Conventional Commits enforced by a commit-msg hook. Do this now — a changelog started later is an invented one.

## 6. Guard the structure with checks, not documents
A written rule decays. Add CI checks that fail the build:
- Import boundaries — pages cannot import from another feature's internals; backend layers cannot skip a layer.
- No file over an agreed line count without an explicit exemption.
- No design literals outside tokens.ts.
- No route without a validator.
Anything you would otherwise write as a standing instruction in PROJECT.md is a candidate for a check.

## 7. Apply ponytail throughout
No folder holding one file. No index that only re-exports. No wrapper that only forwards arguments. No config value with one caller. Flat beats clever. If a layer exists only because the diagram has one, remove it.

## Deliverables
The audit and plan first. After approval: the move, in commits small enough to review, with `docs/ARCHITECTURE.md` documenting the final structure and the rules, and every test still passing. Report what you moved, what you deleted, and what you deliberately left alone.
