-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- Limits must stay sensible even if someone writes to the table directly.
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_value_range" CHECK ("value" BETWEEN 1 AND 50);
