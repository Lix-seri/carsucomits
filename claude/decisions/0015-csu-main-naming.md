# 0015 — One name for the university: "Caraga State University – Main Campus" / "CSU Main"

- **Date:** 2026-09-26 · **Status:** Accepted

**Context.** Item 7 asks for one official form of the university's name everywhere: UI text, page titles, metadata, emails and seed data. The long form is "Caraga State University – Main Campus", and "CSU Main" is the short form where space is tight. Every change must be listed. The code used "Caraga State University", "CSU Caraga", "CSU" and "CSU students".

**Decision.**
- **The full name** is used where the institution is named in a sentence: About, Terms, the footer, the sign-in and register pages, the site description.
- **"CSU Main"** is used where space is tight: the commission meta line, the sidebar subtitle, the page title, short phrases like "CSU Main students".
- **"CSU email" becomes "@carsu.edu.ph email".** The email domain belongs to the whole university, so naming the domain is both exact and shorter. It also avoids implying that the address proves someone is a Main Campus student.
- **Unchanged:**
  - "Caraga State University" inside the long form.
  - The product name "CarsuComits".
  - The domain `carsu.edu.ph`.
- **Not applicable:**
  - The app sends no emails.
  - The seed data (`prisma/seed.mjs`) contains no university name.

**Every place changed**

| File | Before | After |
|---|---|---|
| `src/app/(site)/commission/[id]/page.tsx` | CSU Caraga | CSU Main |
| `src/app/layout.tsx` (page title) | CarsuComits — CSU Commission Marketplace | CarsuComits — CSU Main commission marketplace |
| `src/app/layout.tsx` (meta description) | Caraga State University's trusted marketplace for student commissions and services. | The commission marketplace for students of Caraga State University – Main Campus. |
| `src/app/about/page.tsx` (lead) | Caraga State University's official, secure commission marketplace. | The official, secure commission marketplace of Caraga State University – Main Campus. |
| `src/app/about/page.tsx` | CSU email required | A @carsu.edu.ph email is required |
| `src/app/about/page.tsx` | Built by CSU, for CSU | Built by CSU Main students, for CSU Main |
| `src/app/about/page.tsx` | Many CSU students | Many CSU Main students |
| `src/app/about/page.tsx` | requires a CSU email · Sign up with your CSU email | requires a @carsu.edu.ph email · Sign up with your @carsu.edu.ph email |
| `src/app/terms/page.tsx` | Students, faculty and staff of Caraga State University | … of Caraga State University – Main Campus |
| `src/components/layout/site-footer.tsx` | Caraga State University's trusted marketplace… · Powered by CSU Students | A commission marketplace for students of Caraga State University – Main Campus… · Built by CSU Main students |
| `src/components/layout/dashboard-sidebar.tsx` | CSU student marketplace | CSU Main marketplace |
| `src/features/auth/login-form.tsx` | CSU Email Address · © CarsuComits · Caraga State University | Email (@carsu.edu.ph) · CarsuComits · Caraga State University – Main Campus |
| `src/features/auth/register-form.tsx` | CSU Email Address · Join the CSU Commission Marketplace · Caraga State University | Email (@carsu.edu.ph) · For CSU Main students with an @carsu.edu.ph email · Caraga State University – Main Campus |
| `src/features/commissions/browse-content.tsx` | Open work posted by CSU students | Open work posted by CSU Main students |
| `src/features/landing/landing-content.tsx` | Find Skilled Students… CSU's trusted commission marketplace | For students of CSU Main · Get it done by a fellow CSU Main student |
| `src/features/verification/verify-form.tsx` | (new) | As printed on your student ID |
| `README.md`, `docs/ARCHITECTURE.md` | Caraga State University students | Caraga State University – Main Campus students |

**Consequences.** A grep for `CSU` in `src/` now returns only "CSU Main" and the full name. New copy should follow the same rule.
