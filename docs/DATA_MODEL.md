# Data model

The source of truth is `prisma/schema.prisma`, which uses PostgreSQL. IDs are `cuid()` strings, and every table has `createdAt`.

## Tables

| Model | Purpose | Key fields and constraints |
|---|---|---|
| `User` | An account | `email` (unique), `passwordHash`, `role`, `status`, `bio`, `avatarUrl`, MFA fields (`mfaEnabled`, `totpSecret`, `mfaBackupCodes`). `emailVerified*` fields are unused |
| `Skill` | A self-declared skill | `userId`, `name`, `level` |
| `Commission` | A posted task | `title`, `description`, `category`, `subcategory`, `requiredLevel`, `fareMin`/`fareMax`/`fareUnit` (advertised range), `deadline`, `status`, `commissionerId`, `awardedToId` (plain string, no FK), `coverImageUrl` |
| `Application` | A user applies to a commission | unique `(commissionId, applicantId)`; `status`; `coverLetter`; `proposedRate` (not set by the UI) |
| `Deliverable` | A file from the awarded student | `fileUrl` (public Blob URL), `fileName`, `fileSize`, `message`, `status`, `reviewerNotes` |
| `Rating` | 1–5 stars and a comment | unique `(commissionId, raterId, rateeId)`; upserted, so it can be changed |
| `Message` | A direct message | `senderId`, `recipientId`, optional `commissionId`, `readAt` |
| `Notification` | In-app notification | `userId`, `type` (free text), `title`, `body`, `link`, `readAt` |
| `Report` | User-on-user report | `reporterId`, `reporteeId`, `reason` (free text), `details`, `status`, `resolvedById` (no FK) |
| `AuditLog` | Action log | `actorId`, `action`, `target` (free text), `meta` (JSON string) |
| `SavedCommission` | Bookmark | unique `(userId, commissionId)` |
| `PasswordResetToken` | Unused since password reset was removed | |

## Enums

| Enum | Values |
|---|---|
| `Role` | `STUDENT_EMPLOYEE`, `COMMISSIONER`, `ADMIN` |
| `AccountStatus` | `ACTIVE`, `WARNED`, `SUSPENDED`, `BANNED` |
| `Category` | `ACADEMIC`, `TECHNICAL`, `GENERAL_ERRANDS`, `ADMINISTRATIVE` |
| `SkillLevel` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` |
| `CommissionStatus` | `OPEN`, `IN_PROGRESS`, `AWAITING_REVIEW`, `COMPLETED`, `CANCELLED`, `DISPUTED` |
| `ApplicationStatus` | `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN` |
| `DeliverableStatus` | `SUBMITTED`, `APPROVED`, `REVISION_REQUESTED` |
| `ReportStatus` | `PENDING`, `UNDER_INVESTIGATION`, `RESOLVED`, `ESCALATED` |

## Money

**No money is recorded.**
- The fare fields are an advertised range.
- No agreed price is stored when an applicant is hired.
- No payments go through the platform.

## Migrations

- Migrations live in `prisma/migrations/`. `0_init` is the baseline and equals the schema as it was before migrations were introduced.
- Create a new one with `npx prisma migrate dev --name <change>`.
- The build applies pending migrations, as described in [DEPLOYMENT.md](DEPLOYMENT.md).
