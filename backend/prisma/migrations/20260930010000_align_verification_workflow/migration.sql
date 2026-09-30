ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Application"
  ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT,
  ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT,
  ADD COLUMN "assignedOfficer" TEXT DEFAULT 'Officer Allocation Pending',
  ADD COLUMN "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 1500,
  ADD COLUMN "feePaid" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "instrumentName" TEXT,
  ADD COLUMN "location" TEXT,
  ADD COLUMN "remarks" TEXT,
  ADD COLUMN "scheduledDate" TEXT,
  ALTER COLUMN "submittedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'Under review';

ALTER TABLE "ApplicationEvent"
  ALTER COLUMN "previousStatus" TYPE TEXT USING "previousStatus"::TEXT,
  ALTER COLUMN "newStatus" TYPE TEXT USING "newStatus"::TEXT,
  DROP CONSTRAINT "ApplicationEvent_applicationId_fkey",
  ADD CONSTRAINT "ApplicationEvent_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Instrument" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Instrument"
  ADD COLUMN "accuracyClass" TEXT DEFAULT 'Class III',
  ADD COLUMN "certificateNo" TEXT DEFAULT 'Pending Registration',
  ADD COLUMN "lastVerified" TEXT DEFAULT 'Not yet verified',
  ADD COLUMN "nextDue" TEXT DEFAULT 'Immediate verification required',
  ADD COLUMN "premises" TEXT,
  ADD COLUMN "sealNo" TEXT DEFAULT 'Unstamped';

UPDATE "Instrument"
SET "nextDue" = to_char("nextDueDate", 'DD Mon YYYY')
WHERE "nextDueDate" IS NOT NULL;

ALTER TABLE "Instrument"
  DROP COLUMN "nextDueDate",
  ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;

ALTER TABLE "Instrument" ALTER COLUMN "status" SET DEFAULT 'Pending Verification';

DROP TYPE "ApplicationStatus";
DROP TYPE "ApplicationType";
DROP TYPE "InstrumentStatus";

CREATE TABLE "Certificate" (
  "id" TEXT NOT NULL,
  "certificateNo" TEXT NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "instrumentName" TEXT NOT NULL,
  "premises" TEXT NOT NULL,
  "issuedDate" TEXT NOT NULL,
  "expiryDate" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Valid',
  "issuedBy" TEXT NOT NULL,
  "sealNumber" TEXT NOT NULL,
  "qrCodeUrl" TEXT,
  "downloadUrl" TEXT,
  "organisationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScheduledInspection" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "applicationId" TEXT,
  "instrumentId" TEXT,
  "premises" TEXT NOT NULL,
  "scheduledDate" TEXT NOT NULL,
  "timeSlot" TEXT NOT NULL,
  "officerName" TEXT NOT NULL,
  "officerPhone" TEXT NOT NULL,
  "officerDesignation" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Scheduled',
  "checklistReady" BOOLEAN NOT NULL DEFAULT true,
  "organisationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduledInspection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Premises" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "managerName" TEXT NOT NULL,
  "managerPhone" TEXT NOT NULL,
  "activeInstrumentsCount" INTEGER NOT NULL DEFAULT 0,
  "complianceScore" INTEGER NOT NULL DEFAULT 100,
  "organisationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Premises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LicensedRepairer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "licenseNo" TEXT NOT NULL,
  "specialization" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LicensedRepairer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT NOT NULL,
  "unread" BOOLEAN NOT NULL DEFAULT true,
  "userId" TEXT,
  "organisationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Certificate_certificateNo_key" ON "Certificate"("certificateNo");
CREATE INDEX "Certificate_organisationId_idx" ON "Certificate"("organisationId");
CREATE INDEX "Certificate_instrumentId_idx" ON "Certificate"("instrumentId");
CREATE INDEX "ScheduledInspection_organisationId_idx" ON "ScheduledInspection"("organisationId");
CREATE INDEX "Premises_organisationId_idx" ON "Premises"("organisationId");
CREATE UNIQUE INDEX "LicensedRepairer_licenseNo_key" ON "LicensedRepairer"("licenseNo");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_organisationId_idx" ON "Notification"("organisationId");
CREATE INDEX "Application_applicantId_idx" ON "Application"("applicantId");
CREATE INDEX "Instrument_status_idx" ON "Instrument"("status");

ALTER TABLE "Certificate"
  ADD CONSTRAINT "Certificate_instrumentId_fkey"
    FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Certificate_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ScheduledInspection"
  ADD CONSTRAINT "ScheduledInspection_instrumentId_fkey"
    FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "ScheduledInspection_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Premises"
  ADD CONSTRAINT "Premises_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Notification_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;