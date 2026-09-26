# API

All endpoints are Next.js route handlers under `src/app/api/`.

**Responses**
- Success: `{ ok: true, ... }` with status 200.
- Failure: `{ error: "message" }` with 400, 401, 403, 404 or 409.
- `401` means the signed session cookie is missing, invalid, or belongs to a banned or suspended user.

**Where the rules live.** Each handler calls one function in `src/features/<domain>/server.ts`. Business rules and permission checks live there, and this table names that function.

## Auth

| Method & path | Body | Service | Notes |
|---|---|---|---|
| `POST /api/auth/register` | `fullName, email, password` | `auth.register` | `@carsu.edu.ph` only, 8+ character password; signs in |
| `POST /api/auth/login` | `email, password, expectedRole, mfaCode?` | `auth.login` | Returns `{ ok: false, mfaRequired: true }` when a code is needed |
| `POST /api/auth/logout` | — | — | Clears the cookie. POST only, so a link on another site can't sign anyone out |
| `POST /api/auth/mfa/setup` | — | `auth.startMfaSetup` | Returns secret + QR data URL |
| `POST /api/auth/mfa/enable` | `code` | `auth.enableMfa` | Returns one-time backup codes |
| `POST /api/auth/mfa/disable` | `password` | `auth.disableMfa` | |

## Commissions

| Method & path | Body / query | Service | Who |
|---|---|---|---|
| `GET /api/commissions` | `?category&level&q&status` | `commissions.listCommissions` | Anyone |
| `POST /api/commissions` | `title, description, category, subcategory?, requiredLevel, fareMin, fareMax?, fareUnit?, deadline?` | `commissions.createCommission` | Signed in |
| `POST /api/commissions/[id]/cover` · `DELETE` | multipart `file` (JPG/PNG/WebP ≤ 5 MB) | `commissions.setCover` · `removeCover` | Owner |
| `POST /api/saved/[commissionId]` | — | `commissions.toggleSaved` | Signed in |
| `POST /api/commissions/[id]/apply` | `coverLetter?, proposedRate?` | `applications.applyToCommission` | CCIS-verified students, not the owner; once per commission; within the admin-set limits (409 names the limit) |
| `POST /api/applications/[id]/accept` | — | `applications.acceptApplication` | Commission owner. Applicant must still be verified and under the job limit; commission → `AGREEMENT_PENDING` |
| `POST /api/commissions/[id]/agreement` | — | `agreements.acceptAgreement` | Poster or hired student. When both have accepted, the commission → `IN_PROGRESS` and the other applicants are declined |
| `DELETE /api/commissions/[id]/agreement` | `reason?` | `agreements.declineAgreement` | Poster or hired student, before work starts; commission → `OPEN` |
| `POST /api/applications/[id]/decline` | — | `applications.declineApplication` | Commission owner |
| `POST /api/applications/[id]/withdraw` | — | `applications.withdrawApplication` | Applicant, while `PENDING` |
| `POST /api/commissions/[id]/deliverables` | multipart `file` (≤ 20 MB), `message?` | `deliverables.submitDeliverable` | Awarded student |
| `POST /api/deliverables/[id]/decision` | `action: APPROVE \| REQUEST_REVISION, notes?` | `deliverables.decideDeliverable` | Commission owner |
| `POST /api/commissions/[id]/complete` | `stars, comment?` | `ratings.completeWithRating` | Owner; `IN_PROGRESS` only; rating is required |
| `POST /api/commissions/[id]/rate-now` | `stars, comment?` | `ratings.rateRetroactively` | Owner of a completed commission |
| `POST /api/ratings/commissioner` | `commissionId, stars, comment?` | `ratings.rateCommissioner` | Awarded student, after completion |

Ratings of 3 stars or fewer need at least 10 characters of feedback.

## People

| Method & path | Body | Service | Who |
|---|---|---|---|
| `POST /api/profile/avatar` · `DELETE` | multipart `file` (JPG/PNG/WebP/GIF ≤ 5 MB) | `profile.uploadAvatar` · `removeAvatar` | Self |
| `POST /api/skills` | `name, level` | `profile.addSkill` | Self |
| `DELETE /api/skills/[id]` | — | `profile.removeSkill` | Owner of the skill (others get 404) |
| `GET /api/search` | `?q` | `search.search` | Anyone. Up to 5 users and 6 open commissions |
| `GET /api/messages/threads` | — | `messages.listThreads` | Signed in |
| `GET /api/messages/[userId]` | — | `messages.getConversation` | Signed in; marks the messages read |
| `POST /api/messages` | `recipientId, body, commissionId?` | `messages.sendMessage` | Signed in |
| `GET /api/notifications` | — | `notifications.listNotifications` | Anyone (empty when signed out) |
| `PATCH /api/notifications` | `ids?` | `notifications.markNotificationsRead` | Signed in |
| `POST /api/reports` | `reporteeEmail, reason, details?` | `reports.fileReport` | Signed in |
| `GET /api/reports/mine` | — | `reports.listMyReports` | Signed in |
| `POST /api/verification` | multipart `studentIdNumber, ccis=on, proof` (JPG/PNG/WebP/PDF ≤ 2 MB) | `verification.submitVerification` | Signed in, `@carsu.edu.ph`, one pending request at a time |

## Admin

| Method & path | Body | Service |
|---|---|---|
| `POST /api/admin/users/[id]/action` | `action: WARN \| SUSPEND \| BAN \| REINSTATE` | `admin.moderateUser` (needs `reason`) |
| `POST /api/admin/reports/[id]/action` | `action: RESOLVE \| ESCALATE \| REOPEN` | `reports.actOnReport` |
| `POST /api/admin/users/[id]/role` | `role: STUDENT_EMPLOYEE \| USED` | `admin.setUserRole` |
| `PUT /api/admin/settings` | `MAX_PENDING_APPLICATIONS, MAX_ACTIVE_JOBS` (1–50) | `settings.updateLimits` |

These check `assertAdmin` inside the service and write an audit-log entry with before and after values.

## Staff (admins and USED officers)

| Method & path | Body | Service |
|---|---|---|
| `GET /api/verification/[id]/proof` | — | `verification.getProof` (private, `no-store`) |
| `POST /api/verification/[id]/decision` | `decision: APPROVE \| REJECT, note?` (a note is required to reject) | `verification.decideVerification` |
| `POST /api/sellers/[id]/status` | `action: SUSPEND \| REINSTATE, reason` | `verification.setSellerStatus` |

These check `assertStaff` and write an audit-log entry.
