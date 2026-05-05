# CarsuComits — Web App

A web-based commission marketplace for Caraga State University, built from the project charter and Figma design. Connects student employees with commissioners (faculty, staff, orgs) in a verified, university-only gig economy.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** for styling (CSU green `#16A34A`)
- **Prisma** ORM — SQLite for development, MySQL-ready for `web.com.ph` deploy
- **Lucide** icons
- **bcryptjs** for password hashing

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Set up the dev database (SQLite — zero config)
npm run db:push

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000.

## Pages

### Public
| Route | Description |
|---|---|
| `/`         | Landing — hero, category browse, filtered listings, How It Works |
| `/browse`   | Search + category + skill-level filters |
| `/login`    | Login form (`@carsu.edu.ph` enforced) |
| `/register` | Register form |
| `/about`    | Trust & Safety values |

### Student / Commissioner Dashboard (route group `(dashboard)`)
| Route | Description |
|---|---|
| `/dashboard`             | Home feed: greeting, stats, Featured Marketplace, My Hub, profile sidebar |
| `/hub`                   | All tasks I'm doing + tasks I posted |
| `/profile`               | Public profile, skills, stats |
| `/messages`              | Threaded messaging UI |
| `/reports`               | Reports about you / reports you filed / submit new |
| `/commissioner`          | Commissioner home: KPIs, active listings, recent applicants |
| `/commissioner/listings` | Manage listings table |
| `/commissioner/applicants` | All applicants for a listing |
| `/commissioner/post`     | Post a new commission (full page) |

### Admin Panel (`/admin`)
| Route | Description |
|---|---|
| `/admin`           | Flagged Users + Pending Reports + KPI cards |
| `/admin/users`     | Searchable user management (Warn / Suspend / Ban) |
| `/admin/listings`  | All listings (read-only cards) |
| `/admin/reports`   | Flagged Users + Pending Reports + Recent Activity |
| `/admin/logs`      | Color-coded system logs (LOGIN / REPORT / ACTION / SUSPEND) |
| `/admin/settings`  | Admin name, email, notification toggle |

### API
| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Hashes password, creates user, sets cookie session |
| `/api/auth/login`    | POST | Verifies credentials, sets cookie session |
| `/api/auth/logout`   | POST | Clears cookie session |

## Database schema

`prisma/schema.prisma` already defines: `User`, `Skill`, `Commission`, `Application`, `Rating`, `Message`, `Report`, `Notification`, `AuditLog`. Roles: `STUDENT_EMPLOYEE`, `COMMISSIONER`, `ADMIN`. Account status: `ACTIVE`, `WARNED`, `SUSPENDED`, `BANNED` (matches your charter's safety risk plan).

To inspect the dev DB:

```bash
npm run db:studio
```

## Deploying to web.com.ph (MySQL)

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "mysql"`.
2. In `.env`, set `DATABASE_URL="mysql://user:pass@host:3306/carsucomits"`.
3. Run `npx prisma migrate deploy` on the server.
4. Build with `npm run build`, run with `npm start`.

## Project structure

```
app/
├── prisma/schema.prisma          # DB models
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Tailwind + design tokens
│   │   ├── page.tsx              # Landing
│   │   ├── browse/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── about/page.tsx
│   ├── components/
│   │   ├── logo.tsx
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   ├── category-card.tsx
│   │   └── commission-card.tsx
│   └── lib/
│       ├── db.ts                 # Prisma client singleton
│       ├── mock-data.ts          # Sample commissions
│       └── utils.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Charter mapping

Every feature in the charter is reflected in the schema or UI:

| Charter requirement | Where it lives |
|---|---|
| CSU email authentication | Email validation in `/login` and `/register` (`@carsu.edu.ph` enforced) |
| Centralized listings | `/browse` + `Commission` model |
| Categorized search (Academic / Technical / General Errands) | `Category` enum + filter chips |
| Skill levels (Beginner → Expert) | `SkillLevel` enum + `Skill` model |
| Reputation/rating system | `Rating` model + 5-star displays |
| Admin panel | (next iteration) admin routes + `AuditLog` model |
| Ghost / scam reports | `Report` model with `ReportStatus` lifecycle |
| Account ban/suspend | `AccountStatus` enum on `User` |

## What's still TODO

- Persist commissions, applications, ratings, and messages to Prisma (currently UI uses mock arrays)
- Commission detail page + Apply flow
- Real-time notifications (currently a static popover)
- Email verification step after registration
- Prisma seed script to populate sample CSU data
- Deploy guide for `web.com.ph` (MySQL switchover)
