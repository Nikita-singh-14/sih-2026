CREATE TABLE "CertificateComplaint" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "searchedIdentifier" TEXT NOT NULL,
  "instrumentId" TEXT,
  "certificateNo" TEXT,
  "reportedSerialNumber" TEXT,
  "reporterName" TEXT,
  "reporterEmail" TEXT,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'New',
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificateComplaint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CertificateComplaintEvent" (
  "id" TEXT NOT NULL,
  "complaintId" TEXT NOT NULL,
  "previousStatus" TEXT,
  "newStatus" TEXT NOT NULL,
  "notes" TEXT,
  "actorId" TEXT,
  "actorRole" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CertificateComplaintEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CertificateComplaint_status_createdAt_idx" ON "CertificateComplaint"("status", "createdAt");
CREATE INDEX "CertificateComplaint_category_createdAt_idx" ON "CertificateComplaint"("category", "createdAt");
CREATE INDEX "CertificateComplaint_certificateNo_idx" ON "CertificateComplaint"("certificateNo");
CREATE INDEX "CertificateComplaint_instrumentId_idx" ON "CertificateComplaint"("instrumentId");
CREATE INDEX "CertificateComplaintEvent_complaintId_createdAt_idx" ON "CertificateComplaintEvent"("complaintId", "createdAt");

ALTER TABLE "CertificateComplaintEvent"
  ADD CONSTRAINT "CertificateComplaintEvent_complaintId_fkey"
  FOREIGN KEY ("complaintId") REFERENCES "CertificateComplaint"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;