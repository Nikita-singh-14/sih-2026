UPDATE "Instrument"
SET "status" = CASE "status"
  WHEN 'DRAFT' THEN 'Pending Verification'
  WHEN 'ACTIVE' THEN 'Active'
  WHEN 'PENDING_VERIFICATION' THEN 'Pending Verification'
  WHEN 'VERIFIED' THEN 'Verified'
  WHEN 'REJECTED' THEN 'Rejected'
  WHEN 'EXPIRED' THEN 'Expired'
  WHEN 'SUSPENDED' THEN 'Suspended'
  WHEN 'RETIRED' THEN 'Retired'
  ELSE "status"
END;

UPDATE "Application"
SET "status" = CASE "status"
  WHEN 'DRAFT' THEN 'Draft'
  WHEN 'SUBMITTED' THEN 'Submitted'
  WHEN 'UNDER_REVIEW' THEN 'Under review'
  WHEN 'AWAITING_DOCUMENTS' THEN 'Awaiting documents'
  WHEN 'PAYMENT_PENDING' THEN 'Payment pending'
  WHEN 'PAYMENT_CONFIRMED' THEN 'Payment confirmed'
  WHEN 'SCHEDULED' THEN 'Scheduled'
  WHEN 'ASSIGNED' THEN 'Assigned'
  WHEN 'INSPECTION_IN_PROGRESS' THEN 'Inspection in progress'
  WHEN 'PASSED' THEN 'Passed'
  WHEN 'FAILED' THEN 'Failed'
  WHEN 'CERTIFICATE_GENERATED' THEN 'Certificate generated'
  WHEN 'CERTIFICATE_ISSUED' THEN 'Verified'
  WHEN 'EXPIRED' THEN 'Expired'
  WHEN 'SUSPENDED' THEN 'Suspended'
  WHEN 'CANCELLED' THEN 'Cancelled'
  WHEN 'REJECTED' THEN 'Rejected'
  WHEN 'APPEAL_SUBMITTED' THEN 'Appeal submitted'
  ELSE "status"
END;

UPDATE "Application"
SET "type" = CASE "type"
  WHEN 'INITIAL_VERIFICATION' THEN 'Initial verification'
  WHEN 'PERIODIC_REVERIFICATION' THEN 'Re-verification'
  WHEN 'AFTER_REPAIR' THEN 'After repair'
  WHEN 'AFTER_RELOCATION' THEN 'After relocation'
  WHEN 'AFTER_ADJUSTMENT' THEN 'After adjustment'
  WHEN 'SPECIAL_INSPECTION' THEN 'Special inspection'
  WHEN 'APPEAL' THEN 'Appeal'
  ELSE "type"
END;

UPDATE "ApplicationEvent"
SET "previousStatus" = CASE "previousStatus"
      WHEN 'UNDER_REVIEW' THEN 'Under review'
      WHEN 'AWAITING_DOCUMENTS' THEN 'Awaiting documents'
      WHEN 'PAYMENT_PENDING' THEN 'Payment pending'
      WHEN 'PAYMENT_CONFIRMED' THEN 'Payment confirmed'
      WHEN 'INSPECTION_IN_PROGRESS' THEN 'Inspection in progress'
      WHEN 'CERTIFICATE_GENERATED' THEN 'Certificate generated'
      WHEN 'CERTIFICATE_ISSUED' THEN 'Verified'
      WHEN 'APPEAL_SUBMITTED' THEN 'Appeal submitted'
      ELSE "previousStatus"
    END,
    "newStatus" = CASE "newStatus"
      WHEN 'UNDER_REVIEW' THEN 'Under review'
      WHEN 'AWAITING_DOCUMENTS' THEN 'Awaiting documents'
      WHEN 'PAYMENT_PENDING' THEN 'Payment pending'
      WHEN 'PAYMENT_CONFIRMED' THEN 'Payment confirmed'
      WHEN 'INSPECTION_IN_PROGRESS' THEN 'Inspection in progress'
      WHEN 'CERTIFICATE_GENERATED' THEN 'Certificate generated'
      WHEN 'CERTIFICATE_ISSUED' THEN 'Verified'
      WHEN 'APPEAL_SUBMITTED' THEN 'Appeal submitted'
      ELSE "newStatus"
    END;