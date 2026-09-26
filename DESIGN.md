# Design: Pisara, the class board

The CarSUComits marketplace is drawn as the greenboard every CSU Main classroom has. Commissions are paper slips pinned to it with magnets, and progress is written on in chalk. The direction was chosen on 2026-09-26 (see `.impeccable/surfaces/` and `claude/prompts/0004`).

## Tokens
Source of truth: `src/styles/tokens.ts`. The colours are CSS variables that `scripts/theme.mjs` generates into `src/styles/theme.css`. The script fails if any text/background pairing in use drops below WCAG AA, in either theme.

| Role | Light (manila paper) | Dark (the board) | Used for |
|---|---|---|---|
| canvas / surface | `#FBF6EA` / `#FFFDF8` | `#131C18` / `#18241E` | Page ground, cards and slips |
| brand (board green) | 500 `#227A52` | 500 `#2A7F56` | Primary actions, selection, "open" |
| board / chalk | `#1F5C45` / `#F6F2E6` | same | Board panels, hero, admin sidebar |
| gold (yellow chalk) | 400 `#F4C542` | 400 `#E0B53A` | Highlights, stars, the Post button; text on it uses `on-gold` |
| coral (pink chalk) | 400 `#F26B5B` | 500 `#F26B5B` | Celebration, hearts, unread dots |
| academic · technical · errand · admin | indigo · violet · orange · teal | lighter tints | One colour per category (chips, strips, tiles) |
| ink / muted | `#1D2621` / `#57615A` | `#EDEADF` / `#A9B4AC` | Text, secondary text |

- **Dark mode** follows the system setting, so there is no toggle. Illustrations switch to chalk lines (`art-line`) in dark mode.
- **Type:**
  - Bricolage Grotesque ExtraBold for display (`.display`, tracking −0.035em).
  - Geist for body text.
  - Kalam for chalk notes of three words or fewer.
  - Every ₱ amount is heavy and tabular.
- **Shape:** cards use 16–20px corners (`rounded-2xl`/`3xl`) with 2px borders. Shadows are warm and offset (`shadow-card`, `shadow-lift`, `shadow-slip`).

## Components
- **Slips and board:** `.board` (greenboard texture), `.slip` (paper plus a `Magnet`), `.paper-dots` (grid ground).
- **Chalk marks** (`components/ui/chalk.tsx`): underline, circle, check and star. Each draws itself on once with `.chalk-draw`, the signature motion.
- **Badges:** `Badge` has a soft chip for lists and a `sticker` variant (outlined, tilted) for profiles and achievements. `CategoryBadge`/`CategoryIcon` carry category colour and icon. `LevelPips` shows 1–4 pips.
- **Category chips:** outlined when inactive, filled with the category colour when chosen. This is the one state rule used everywhere.
- **Progress:** `CommissionProgress` shows Posted, Hired, Delivered and Completed, always fully labelled. Done stages are solid, the current one is chalk-circled, and future ones are dashed.
- **Tisa** (`components/illustrations/tisa.tsx`): the chalk-stick mascot, in wave, hold, sleep, cheer, lost and search poses. She appears in every empty state (`EmptyState`), the 404 page, auth and celebrations.
- **Other illustrations:** category and lifecycle art (`illustrations/scenes.tsx`) and time-of-day scenes (`illustrations/day.tsx`).
- **Feedback:** `toast()` and `celebrate()` (`components/ui/toast.tsx`); a celebration adds Tisa and a burst of chalk dust.
- **Navigation:**
  - Phones get a bottom tab bar with a raised gold Post button.
  - Ctrl/Cmd+K opens the command palette.
  - The sidebar's active item is a filled row. The staff sidebar is the board.

## Motion
- Chalk strokes draw on in 520ms (ease-out).
- Buttons press to 95%, cards lift on hover, hearts pop.
- Sections rise in as they scroll into view, only where scroll timelines exist and motion is welcome.
- `prefers-reduced-motion` turns every animation off. Content is never hidden waiting for an animation.

## Brand
- **Name:** CarSUComits (PRODUCT.md).
- **Mark:** a board-green speech-bubble slip with a chalk check and a gold magnet. Files are in `public/brand/` (SVG colour, on-dark and mono; favicons at 16, 32, 180 and 512; wordmark PNGs rendered by `scripts/brand-rasters.mjs`).
- **Restrictions:** never the CSU seal, and no claim to be official.

## Rules enforced in code
ESLint rejects the following in components:
- raw palette classes;
- arbitrary Tailwind values;
- `bg-white`/`border-white`/`ring-offset-white`, which ignore dark mode.
