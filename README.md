# CarSUComits

A commission marketplace for Caraga State University – Main Campus students. Students post paid tasks, others apply, the poster hires one, and both sides rate each other after the work is delivered.

Built with Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma and PostgreSQL, and deployed on Vercel.

## Quick start

```bash
npm install
cp .env.example .env        # set AUTH_SECRET, and point DATABASE_URL at the local DB
npm run db:local            # separate terminal: local Postgres on :5433
npx prisma migrate deploy && npm run db:seed
npm run dev                 # http://localhost:3000
```

Full setup, tests and commit conventions: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Documentation

| Doc | What's in it |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Structure, the rules CI enforces, request flow, roles, lifecycle |
| [API](docs/API.md) | Every endpoint, who may call it, and which service handles it |
| [Data model](docs/DATA_MODEL.md) | Tables, enums, migrations |
| [Deployment](docs/DEPLOYMENT.md) | Vercel, Neon, Blob, environment variables |
| [Security](docs/SECURITY.md) | Sessions, authorization, reporting issues |
| [Roadmap](docs/ROADMAP.md) | Phases and feature status |
| [Changelog](CHANGELOG.md) | What changed, per release |

`claude/` holds the working record of the AI-assisted work on this repo: prompts, audits, decisions and batch reports. See [claude/README.md](claude/README.md).
