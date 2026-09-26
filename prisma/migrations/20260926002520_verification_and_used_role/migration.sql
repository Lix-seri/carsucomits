-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'USED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StudentVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentIdNumber" TEXT NOT NULL,
    "proof" BYTEA NOT NULL,
    "proofType" TEXT NOT NULL,
    "proofName" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentVerification_userId_idx" ON "StudentVerification"("userId");

-- CreateIndex
CREATE INDEX "StudentVerification_status_idx" ON "StudentVerification"("status");

-- AddForeignKey
ALTER TABLE "StudentVerification" ADD CONSTRAINT "StudentVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One open request per student at a time.
CREATE UNIQUE INDEX "StudentVerification_one_pending_per_user" ON "StudentVerification"("userId") WHERE "status" = 'PENDING';
-- Keep the stored values sane even if written outside the app.
ALTER TABLE "StudentVerification" ADD CONSTRAINT "StudentVerification_id_format" CHECK ("studentIdNumber" ~ '^[0-9][0-9-]{4,13}[0-9]$');
ALTER TABLE "StudentVerification" ADD CONSTRAINT "StudentVerification_proof_size" CHECK (octet_length("proof") <= 2097152);
