---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app"]
---

# Surface brief: CarSUComits (whole product; lead surface is the landing page)

**Scope:** every student surface, plus auth and the admin panel, per the UI overhaul brief (claude/prompts/0004).
**Modes:** the landing page is Persuade; the app, admin and auth are Operate.

**Audience and job:** CSU Main students, mostly on phones, posting tasks and taking on classmates' work; admins and USED officers moderating. The landing page must make a first-time student understand the offer (a safe campus-only market), trust it, and post or browse within seconds.

**Proof available:** live counts from the database only (open commissions, members, completed commissions), hidden when zero. No testimonials or statistics may be invented.

**Constraints:** no changes to API contracts, schema, auth, permissions or routes. The name is spelled CarSUComits. The copy never says "official". No CSU seal. WCAG AA. `prefers-reduced-motion` is respected. Verified at 360, 768, 1024 and 1440px.

## Direction contract

**THESIS:** The marketplace is the class announcement board, the pisara every CSU room has. Commissions are paper slips pinned on it, and progress is written on in chalk. It refuses the gig-site grid of identical white cards on a white page.

**OWN-WORLD:**
- **Colors:**
  - Board green `#1F5C45` owns large fields (hero board, sidebar in dark mode, stepper).
  - Chalk yellow `#F4C542` and chalk coral `#F26B5B` are for annotation and celebration only.
  - The page ground is manila cream `#FBF6EA`. Dark mode is the board itself, slate green `#17231E`.
- **Categories:** each has its own chalk color: Academic indigo, Technical violet, Errands orange, Admin teal. A chip shows only its outline when inactive and fills with its color when active.
- **Materials:**
  - Paper slips with a slight tilt, held by round magnets.
  - Hand-drawn chalk strokes (underline, circle, check, tally) in SVG.
  - Star-sticker badges; skill levels as 1–4 chalk pips.
- **Type:** Bricolage Grotesque for display, Geist for body text, and a chalk hand (Kalam) only for annotations of three words or fewer. ₱ amounts are heavy and tabular.

**STORY:** A student sees real open slips on the board and understands "classmates post, I help, I get paid". Trust comes from the rules shown plainly: @carsu.edu.ph only, verified CCIS sellers, ratings, and no graded work. They post or apply; each later step is written onto their slip in chalk until it's completed and rated.

**FIRST VIEWPORT (phone first):**
- **Top:** logo and a Sign in link.
- **Headline:** "Get it done by a fellow CSU Main student." in display type at 40px, with a chalk underline drawn under "fellow".
- **Below it:** one line of plain explanation, then Post a commission (primary, board green) and Browse (secondary).
- **Then:** a greenboard panel filling the rest of the first screen with three real open commissions as tilted slips (fare circled in chalk, "Due in 3 days" in chalk) and a live tally strip.
- **Desktop:** text on the left, the board on the right at full hero height.

**FORM:** Pisara, the classroom greenboard. It is candidate 7 of my ordered list (notice board, pad paper, sari-sari price cards, jeepney signboards, student ID lanyards, org-fair tarpaulins, pisara). Seed key d86000c2. The signature interaction is a chalk stroke drawing itself on (highlights, stepper checks, celebration) at 150–300ms; with reduced motion it shows in its final state.

**Raises from the declined challengers:**
- Woodblock: outline-then-fill as the single state rule.
- Type specimen: hierarchy by scale contrast, fewer boxes.
- Daylight: real-time countdowns and a time-of-day greeting.
- Detector: stepper stages drawn solid, circled or dashed.
- Synth: the active nav item lights along its full row.
- Forge: tabular numerals for every ₱.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- **Profile banner:** there's no stored preference, so the pattern is derived from the user id.
- **Mascot:** optional. The chalk-stick character "Tisa" (Filipino for chalk) is proposed for empty states and success screens.
