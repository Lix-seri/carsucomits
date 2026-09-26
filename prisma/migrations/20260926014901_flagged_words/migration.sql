-- CreateEnum
CREATE TYPE "FlagCategory" AS ENUM ('GENERAL', 'ACADEMIC_DISHONESTY');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('PENDING', 'APPROVED', 'REMOVED');

-- CreateEnum
CREATE TYPE "FlaggedKind" AS ENUM ('COMMISSION', 'MESSAGE', 'APPLICATION', 'SKILL');

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "heldForReview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "heldForReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FlaggedWord" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "category" "FlagCategory" NOT NULL DEFAULT 'GENERAL',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlaggedWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlaggedContent" (
    "id" TEXT NOT NULL,
    "kind" "FlaggedKind" NOT NULL,
    "refId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "terms" TEXT[],
    "category" "FlagCategory" NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlaggedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlaggedWord_term_key" ON "FlaggedWord"("term");

-- CreateIndex
CREATE INDEX "FlaggedContent_status_idx" ON "FlaggedContent"("status");

-- CreateIndex
CREATE INDEX "FlaggedContent_kind_refId_idx" ON "FlaggedContent"("kind", "refId");

-- AddForeignKey
ALTER TABLE "FlaggedContent" ADD CONSTRAINT "FlaggedContent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Starter word list (decision 0011). Admins add and remove terms on /admin/moderation.
-- Academic dishonesty (item 9): posts asking for graded work go to review.
INSERT INTO "FlaggedWord" ("id", "term", "category") VALUES
  ('seed-ad-01', 'thesis', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-02', 'capstone', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-03', 'dissertation', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-04', 'research paper', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-05', 'term paper', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-06', 'do my assignment', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-07', 'do my homework', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-08', 'write my essay', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-09', 'take my exam', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-10', 'take my quiz', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-11', 'answer my exam', 'ACADEMIC_DISHONESTY'),
  ('seed-ad-12', 'take my online class', 'ACADEMIC_DISHONESTY'),
  -- General: scams and abuse.
  ('seed-ge-01', 'scam', 'GENERAL'),
  ('seed-ge-02', 'send gcash first', 'GENERAL'),
  ('seed-ge-03', 'putangina', 'GENERAL'),
  ('seed-ge-04', 'fuck', 'GENERAL')
ON CONFLICT ("term") DO NOTHING;
