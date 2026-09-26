# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Students of Caraga State University – Main Campus (Ampayon, Butuan City), most of them on their phones. The same person is often both sides of the market: posting a task they need done (a poster, an errand, tutoring, data entry) and taking on work from classmates to earn a little money. Two staff audiences use their own panels: admins (platform moderation) and USED officers (University Student Enterprise Development, who oversee student sellers).

## Product Purpose
A campus-only commission marketplace: a student posts a task with a fare in pesos (₱) and a deadline, classmates apply, the poster hires one, both accept a short work agreement, the student delivers, the poster reviews the delivery, and both rate each other. Success is a task done by a fellow student without the scams, ghosting and dead ends of posting in Facebook groups.

## Positioning
Every account is a verified @carsu.edu.ph address, and only CCIS-verified students can take on work. Reputations are earned through two-way ratings, and the whole commission lives in one place: posting, hiring, the agreement, delivery, review and rating. A general freelance site or a Facebook group can't offer a closed, reputation-backed campus market.

## Operating Context
- Mostly used on phones, between classes and around campus; laptops for longer tasks.
- Categories: Academic (tutoring only, never doing graded work for someone), Technical, General Errands, Administrative.
- Skill levels: Beginner, Intermediate, Advanced, Expert.
- Roles: Student, USED officer, Admin.
- Money changes hands directly between the two students, off the platform. "Completed" means the work is done, not that payment happened.

## Capabilities and Constraints
- **Built:** browsing and posting commissions; applications with limits; a versioned work agreement before work starts; deliverables with revision requests; two-way ratings; messages; notifications; reports; CCIS verification; USED seller oversight; an append-only audit log; admin moderation with a flagged-word review queue; transaction history; Available/Busy status.
- **Fixed during the UI overhaul (claude/prompts/0004):** API contracts, the database schema, auth, role permissions and routing.
- **Not supported by the backend:** payments, typing indicators, user-chosen banner settings (no stored preference), outgoing email.
- **Stack:** Next.js 15 (App Router) with React 19, TypeScript and Tailwind 3, Prisma on Postgres (Neon), and Vercel Blob for uploads.

## Brand Commitments
- **Name:** **CarSUComits**, spelled exactly like that everywhere: logo, page titles, meta, favicon and copy. Confirmed by the owner, 2026-09-26.
- **Status:** a student-built project, not officially recognized by the university. Copy must not say "official". Never use the CSU seal or any university logo; campus identity may be referenced through color only.
- **University name:** "Caraga State University – Main Campus", or "CSU Main" where space is tight (decision 0015).
- **Voice:** warm and student-to-student. A light touch of Taglish is fine in fun spots such as empty states and success messages. Core instructions stay in clear English.

## Evidence on Hand
- **Live data:** open commissions, members and completed commissions, which can back real counts.
- **Missing:** testimonials, press, partner logos and usage statistics beyond what the database holds. Do not fabricate any of them.

## Product Principles
1. Trust before delight: every playful touch must leave the task, the price and the rules clearer, not murkier.
2. Students helping students: copy and imagery speak peer-to-peer, never corporate or official.
3. Honest by construction: show only what the data proves (no fake badges, counts, activity or typing states).
4. Phone-first: the thumb path to post, apply, accept and rate comes before desktop polish.
5. Integrity is part of the product: tutoring yes, doing someone's graded work no.

## Accessibility & Inclusion
WCAG AA contrast everywhere, including text on colored chips; full keyboard access with visible focus; `prefers-reduced-motion` respected; tested at 360, 768, 1024 and 1440px.
