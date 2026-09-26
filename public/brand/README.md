# CarSUComits brand files

Original artwork for CarSUComits, a student-built marketplace. It is not a university mark: never pair it with, or substitute it for, the CSU seal.

| File | Use |
|---|---|
| carsucomits-mark.svg | Icon-only mark in colour (board green slip, chalk check, gold magnet) |
| carsucomits-mark-on-dark.svg | Mark on dark grounds (admin sidebar, dark mode, board panels) |
| carsucomits-mark-mono.svg | Single colour; the check is cut out, so it takes `currentColor` |
| carsucomits-wordmark.png · -on-dark.png | Full lockup set in Bricolage Grotesque ExtraBold |
| favicon-16.png · favicon-32.png · apple-touch-icon.png (180) · icon-512.png | App and browser icons |

The PNGs are rendered from the SVGs by `node scripts/brand-rasters.mjs`. In the app, the lockup is drawn live by `src/components/layout/logo.tsx`.
