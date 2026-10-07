CREATE TABLE "InspectionReport" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "officerObservations" TEXT NOT NULL DEFAULT '',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracyMeters" DOUBLE PRECISION NOT NULL,
    "locationCapturedAt" TIMESTAMP(3) NOT NULL,
    "selfieImage" BYTEA NOT NULL,
    "selfieCapturedAt" TIMESTAMP(3) NOT NULL,
    "evidence" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InspectionReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InspectionReport_applicationId_key" ON "InspectionReport"("applicationId");
CREATE INDEX "InspectionReport_officerId_submittedAt_idx" ON "InspectionReport"("officerId", "submittedAt");

ALTER TABLE "InspectionReport"
    ADD CONSTRAINT "InspectionReport_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InspectionReport"
    ADD CONSTRAINT "InspectionReport_officerId_fkey"
    FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
