ALTER TABLE "User" ADD COLUMN "organisationId" TEXT;

ALTER TABLE "Organisation"
ADD COLUMN "address" TEXT,
ADD COLUMN "expiryAlertDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN "gstin" TEXT,
ADD COLUMN "lmRegistrationNo" TEXT;

CREATE INDEX "User_organisationId_idx" ON "User"("organisationId");

ALTER TABLE "User"
ADD CONSTRAINT "User_organisationId_fkey"
FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id")
ON DELETE SET NULL ON UPDATE CASCADE;