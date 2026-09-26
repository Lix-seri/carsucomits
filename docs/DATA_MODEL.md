# Data model

The source of truth is `prisma/schema.prisma`, which uses PostgreSQL. IDs are `cuid()` strings, and every table has `createdAt`.

## Tables

| Model | Purpose | Key fields and constraints |
|---|---|---|
| `User` | An account | `email` (unique), `passwordHash`, `role`, `status`, `bio`, `avatarUrl`, `verifiedAt` (CCIS verification; required to take on work), MFA fields (`mfaEnabled`, `totpSecret`, `mfaBackupCodes`). `emailVerified*` fields are unused |
| `Skill` | A self-declared skill | `userId`, `name`, `level` |
| `Commission` | A posted task | `title`, `description`, `category`, `subcategory`, `requiredLevel`, `fareMin`/`fareMax`/`fareUnit` (advertised range), `deadline`, `status`, `commissionerId`, `awardedToId` (plain string, no FK), `coverImageUrl` |
| `Application` | A user applies to a commission | unique `(commissionId, applicantId)`; `status`; `coverLetter`; `proposedRate` (not set by the UI) |
| `Deliverable` | A file from the awarded student | `fileUrl` (public Blob URL), `fileName`, `fileSize`, `message`, `status`, `reviewerNotes` |
| `Rating` | 1–5 stars and a comment | unique `(commissionId, raterId, rateeId)`; upserted, so it can be changed |
| `Message` | A direct message | `senderId`, `recipientId`, optional `commissionId`, `readAt` |
| `Notification` | In-app notification | `userId`, `type` (free text), `title`, `body`, `link`, `readAt` |
| `Report` | User-on-user report | `reporterId`, `reporteeId`, `reason` (free text), `details`, `status`, `resolvedById` (no FK) |
| `AuditLog` | Append-only action log (triggers reject UPDATE, DELETE and TRUNCATE) | `actorId`, `action`, `target` (id of what was acted on), `before`/`after` (JSONB), `meta` (JSON string) |
| `Setting` | Admin-set limits | `key` (primary key), `value` (CHECK 1–50). A missing row means the default in `features/settings/limits.ts` |
| `AgreementAcceptance` | One party's acceptance of the work agreement | unique `(commissionId, userId, version)`; `terms` (JSONB snapshot of title, scope, fare, deadline); `acceptedAt`. A trigger on `Commission` refuses `OPEN`/`AGREEMENT_PENDING` → `IN_PROGRESS` without both parties' rows |
| `StudentVerification` | A CCIS verification request | `studentIdNumber` (CHECK format), `proof` (bytea ≤ 2 MB, private), `status`, reviewer fields. At most one `PENDING` per user (partial unique index) |
| `SavedCommission` | Bookmark | unique `(userId, commissionId)` |
| `PasswordResetToken` | Unused since password reset was removed | |

## Enums

| Enum | Values |
|---|---|
| `Role` | `STUDENT_EMPLOYEE`, `COMMISSIONER`, `ADMIN`, `USED` |
| `VerificationStatus` | `PENDING`, `APPROVED`, `REJECTED`, `REVOKED` |
| `AccountStatus` | `ACTIVE`, `WARNED`, `SUSPENDED`, `BANNED` |
| `Category` | `ACADEMIC`, `TECHNICAL`, `GENERAL_ERRANDS`, `ADMINISTRATIVE` |
| `SkillLevel` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` |
| `CommissionStatus` | `OPEN`, `AGREEMENT_PENDING`, `IN_PROGRESS`, `AWAITING_REVIEW`, `COMPLETED`, `CANCELLED`, `DISPUTED` |
| `ApplicationStatus` | `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN` |
| `DeliverableStatus` | `SUBMITTED`, `APPROVED`, `REVISION_REQUESTED` |
| `ReportStatus` | `PENDING`, `UNDER_INVESTIGATION`, `RESOLVED`, `ESCALATED` |

## Money

**No payments go through the platform.**
- The fare fields are an advertised range.
- The agreed fare is stored in each `AgreementAcceptance.terms` snapshot.
- Transaction history (`/transactions`, `/admin/transactions`) is derived from hired commissions (decision 0014).

## Migrations

- Migrations live in `prisma/migrations/`. `0_init` is the baseline and equals the schema as it was before migrations were introduced.
- Create a new one with `npx prisma migrate dev --name <change>`.
- The build applies pending migrations, as described in [DEPLOYMENT.md](DEPLOYMENT.md).
