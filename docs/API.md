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
| `POST /api/auth/logout` · `GET /api/auth/logout` | — | — | Clears the cookie; GET redirects to `/login` |
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
| `POST /api/commissions/[id]/apply` | `coverLetter?, proposedRate?` | `applications.applyToCommission` | Not the owner; once per commission |
| `POST /api/applications/[id]/accept` | — | `applications.acceptApplication` | Commission owner. Rejects the others; commission → `IN_PROGRESS` |
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

## Admin

| Method & path | Body | Service |
|---|---|---|
| `POST /api/admin/users/[id]/action` | `action: WARN \| SUSPEND \| BAN \| REINSTATE` | `admin.moderateUser` |
| `POST /api/admin/reports/[id]/action` | `action: RESOLVE \| ESCALATE \| REOPEN` | `reports.actOnReport` |

Both check `assertAdmin` inside the service and write an audit-log entry.
