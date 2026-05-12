# CarsuComits — Web App

A web-based commission marketplace for Caraga State University, built from the project charter and Figma design. Connects student employees with commissioners (faculty, staff, orgs) in a verified, university-only gig economy.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** for styling (CSU green `#16A34A`)
- **Prisma** ORM with **Postgres** (Neon-hosted)
- **Vercel Blob** for avatar image storage
- **Lucide** icons
- **bcryptjs** for password hashing

## Two ways to run this project

| Goal | Read |
|---|---|
| Run locally on your laptop | [SETUP.md](./SETUP.md) |
| Deploy publicly on Vercel + Neon | [DEPLOY.md](./DEPLOY.md) |

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your Neon DATABASE_URL
cp .env.example .env

# 3. Push the schema to your database
npm run db:push

# 4. Seed the default admin account
npm run db:seed

# 5. Run the dev server
npm run dev
```

Open `http://localhost:3000`.

Default admin login (Admin tab): `glen.licayan@carsu.edu.ph` / `123456`.

## Pages

### Public
| Route | Description |
|---|---|
| `/`              | Landing — hero, categories, filtered listings, How It Works |
| `/browse`        | Search + category + skill-level filters |
| `/commission/:id`| Commission detail with Apply button |
| `/u/:id`         | Public user profile (skills, ratings, reviews, trust badge) |
| `/login`         | Login form with Student/Admin tabs (`@carsu.edu.ph` enforced) |
| `/register`      | Register form |
| `/about`         | Trust & Safety values |

### Student / Commissioner Dashboard
| Route | Description |
|---|---|
| `/dashboard`              | Home feed: greeting, stats, Featured Marketplace, My Hub, profile sidebar |
| `/hub`                    | Tasks I'm doing + tasks I posted + pending ratings banner |
| `/profile`                | My profile with avatar uploader, skills manager, reviews |
| `/messages`               | Threaded messaging UI with real-time polling |
| `/reports`                | Reports about you / reports you filed / submit new |
| `/commissioner`           | Commissioner home: KPIs, active listings, recent applicants |
| `/commissioner/listings`  | Manage all my listings |
| `/commissioner/applicants`| All applicants with Accept/Decline |
| `/commissioner/post`      | Post a new commission |

### Admin Panel (`/admin`) — admin role only
| Route | Description |
|---|---|
| `/admin`           | Flagged Users + Pending Reports + KPI cards |
| `/admin/users`     | Searchable user management (Warn / Suspend / Ban) |
| `/admin/listings`  | All listings |
| `/admin/reports`   | Flagged Users + Pending Reports + Recent Activity |
| `/admin/logs`      | Color-coded system logs |
| `/admin/settings`  | Admin name, email, notification toggle |

### API
| Route | Method | Description |
|---|---|---|
| `/api/auth/register`              | POST   | Create account, set cookie |
| `/api/auth/login`                 | POST   | Verify creds + role, set cookie |
| `/api/auth/logout`                | POST/GET | Clear cookie |
| `/api/profile/avatar`             | POST/DELETE | Upload/delete avatar via Vercel Blob |
| `/api/skills`                     | POST   | Add a skill |
| `/api/skills/[id]`                | DELETE | Remove a skill |
| `/api/commissions`                | GET/POST | List/filter commissions, create new |
| `/api/commissions/[id]/apply`     | POST   | Apply (with duplicate prevention) |
| `/api/commissions/[id]/complete`  | POST   | Mark complete + rate atomically |
| `/api/commissions/[id]/rate-now`  | POST   | Retroactively rate a completed commission |
| `/api/applications/[id]/accept`   | POST   | Accept applicant + reject others |
| `/api/applications/[id]/decline`  | POST   | Decline applicant |
| `/api/ratings`                    | POST   | Submit rating (also called by complete flow) |
| `/api/messages/threads`           | GET    | List my conversations |
| `/api/messages/[userId]`          | GET    | Conversation with one user (marks read) |
| `/api/messages`                   | POST   | Send a message |
| `/api/notifications`              | GET/PATCH | List + mark as read |
| `/api/reports`                    | POST   | File a report |
| `/api/reports/mine`               | GET    | My reports (filed + about me) |
| `/api/admin/users/[id]/action`    | POST   | Warn/Suspend/Ban/Reinstate (admin only) |
| `/api/admin/reports/[id]/action`  | POST   | Resolve/Escalate/Reopen (admin only) |
| `/api/search`                     | GET    | Combined user + commission search |

## Database schema

`prisma/schema.prisma` defines: `User`, `Skill`, `Commission`, `Application`, `Rating`, `Message`, `Report`, `Notification`, `AuditLog`. Enums: `Role`, `SkillLevel`, `Category`, `CommissionStatus`, `ApplicationStatus`, `ReportStatus`, `AccountStatus`.

Inspect the DB visually:

```bash
npm run db:studio
```

## Charter mapping

| SRS / Charter requirement | Where it lives |
|---|---|
| CSU email authentication (DC-1) | Login + register enforce `@carsu.edu.ph` |
| Centralized listings (REQ-3.1) | `/browse` + Commission model |
| Categorized search (REQ-3.2) | Category + level filters on `/browse` |
| Apply flow (REQ-3.3) | `/commission/[id]` + Apply button |
| Duplicate-apply prevention (REQ-3.4) | Schema `@@unique` + API check |
| Job tracking dashboard (REQ-4.1–4.5) | `/hub`, `/commissioner` |
| Accept/Decline (REQ-4.2/4.3) | `/api/applications/[id]/accept` + `/decline` |
| Mark Completed (REQ-4.4) | `/api/commissions/[id]/complete` (atomic with rating) |
| Rating prompt after Complete (REQ-5.1) | RatingModal opens before completion |
| Avg rating + reviews on profile (REQ-5.2) | `/profile`, `/u/[id]` with TrustBadge + breakdown |
| Auto-flag <3.0 (REQ-5.3) | After every Rating creation |
| Submit reports (REQ-5.4) | `/reports` Submit New Report |
| Admin panel access (REQ-6.1) | Layout-level role guard on `/admin/*` |
| User moderation (REQ-6.3) | Warn/Suspend/Ban via `/api/admin/users/[id]/action` |
| In-platform notifications | `Notification` model fed on every action |

## Project structure

```
app/
├── prisma/
│   ├── schema.prisma             # Postgres + enums
│   └── seed.mjs                  # Bootstraps admin account
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Tailwind + brand tokens
│   │   ├── page.tsx              # Landing
│   │   ├── browse/page.tsx
│   │   ├── commission/[id]/page.tsx
│   │   ├── u/[id]/page.tsx       # Public profile
│   │   ├── login/page.tsx, register/page.tsx, about/page.tsx
│   │   ├── (dashboard)/          # Authenticated routes
│   │   │   ├── layout.tsx        # Sidebar + topbar shell
│   │   │   ├── dashboard/, hub/, profile/, messages/, reports/
│   │   │   └── commissioner/{,listings,applicants,post}/
│   │   ├── admin/                # Admin-only routes
│   │   │   ├── layout.tsx        # Role guard
│   │   │   └── {users,listings,reports,logs,settings}/
│   │   └── api/                  # Server endpoints
│   │       ├── auth/, profile/avatar/, skills/[id]/
│   │       ├── commissions/[id]/{apply,complete,rate-now}/
│   │       ├── applications/[id]/{accept,decline}/
│   │       ├── ratings/, reports/, search/
│   │       ├── messages/{[userId],threads}/
│   │       ├── notifications/
│   │       └── admin/{users,reports}/[id]/action/
│   ├── components/
│   │   ├── site-header.tsx, site-footer.tsx, logo.tsx
│   │   ├── avatar.tsx, trust-badge.tsx, rating-breakdown.tsx
│   │   ├── apply-button.tsx, mark-complete-button.tsx, rating-modal.tsx
│   │   ├── applicant-decision-buttons.tsx, rate-now-button.tsx
│   │   ├── message-button.tsx, back-button.tsx, logout-button.tsx
│   │   ├── browse-content.tsx, landing-content.tsx, category-card.tsx
│   │   ├── commission-card.tsx
│   │   ├── dashboard/{sidebar,topbar,profile-card,search-bar,
│   │   │              skills-manager,avatar-uploader}.tsx
│   │   ├── admin/{admin-sidebar,user-action-buttons,
│   │   │          report-action-buttons}.tsx
│   │   └── modals/{modal-shell,notifications-popover,
│   │               post-commission-modal}.tsx
│   └── lib/
│       ├── db.ts                 # Prisma client singleton
│       ├── session.ts            # Cookie session
│       ├── queries.ts            # Reusable DB helpers
│       ├── notifications.ts      # notify() helper
│       ├── trust.ts              # Trust tier + rating distribution
│       ├── types.ts              # Shared TS types
│       ├── mock-data.ts          # Legacy sample data (unused now)
│       └── utils.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── README.md, SETUP.md, DEPLOY.md
└── .env.example, .gitignore
```
