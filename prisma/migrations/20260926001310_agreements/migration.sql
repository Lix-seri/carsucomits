-- AlterEnum
ALTER TYPE "CommissionStatus" ADD VALUE 'AGREEMENT_PENDING';

-- CreateTable
CREATE TABLE "AgreementAcceptance" (
    "id" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "terms" JSONB NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgreementAcceptance_commissionId_idx" ON "AgreementAcceptance"("commissionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgreementAcceptance_commissionId_userId_version_key" ON "AgreementAcceptance"("commissionId", "userId", "version");

-- AddForeignKey
ALTER TABLE "AgreementAcceptance" ADD CONSTRAINT "AgreementAcceptance_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "Commission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementAcceptance" ADD CONSTRAINT "AgreementAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Work can't start until both the poster and the hired student have accepted the agreement.
-- (Going back to IN_PROGRESS after a revision request is not "starting", so it's allowed.)
CREATE FUNCTION commission_requires_agreement() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'IN_PROGRESS' AND OLD.status IN ('OPEN', 'AGREEMENT_PENDING') THEN
    IF NEW."awardedToId" IS NULL OR (
      SELECT COUNT(DISTINCT "userId") FROM "AgreementAcceptance"
      WHERE "commissionId" = NEW.id AND "userId" IN (NEW."commissionerId", NEW."awardedToId")
    ) < 2 THEN
      RAISE EXCEPTION 'Commission % cannot start before both parties accept the agreement', NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commission_agreement_before_start
  BEFORE UPDATE OF status ON "Commission"
  FOR EACH ROW EXECUTE FUNCTION commission_requires_agreement();
