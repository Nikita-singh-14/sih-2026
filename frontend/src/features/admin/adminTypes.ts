export type AdminApplicationStatus =
  | 'Pending Review'
  | 'Under Review'
  | 'Assigned'
  | 'Approved'
  | 'Rejected'
  | 'Returned for Correction'
  | 'Scheduled'
  | 'Verified'
  | 'Awaiting documents'

export type VerificationType =
  | 'Initial verification'
  | 'Re-verification'
  | 'After repair'
  | 'Special inspection'

export interface ApplicationDocument {
  id: string
  name: string
  type: string
  size: string
  uploadedDate: string
  url?: string
}

export interface ApplicationRemark {
  id: string
  author: string
  role: string
  date: string
  text: string
}

export interface ApplicationHistoryItem {
  id: string
  date: string
  action: string
  by: string
  notes?: string
}

export interface AdminApplication {
  id: string
  type: VerificationType | string
  instrumentId: string
  instrument: string
  applicant: string
  applicantGstin?: string
  applicantEmail?: string
  applicantPhone?: string
  applicantAddress?: string
  location: string
  district: string
  submitted: string
  submittedDate: string
  assignedOfficer: string
  assignedOfficerEmail?: string
  status: AdminApplicationStatus
  documents: ApplicationDocument[]
  remarks: ApplicationRemark[]
  history: ApplicationHistoryItem[]
}

export type AdminInstrumentStatus =
  | 'Active'
  | 'Pending Verification'
  | 'Expiring Soon'
  | 'Expired'
  | 'Flagged'
  | 'Suspended'

export interface VerificationHistoryRecord {
  id: string
  certNo: string
  issuedDate: string
  expiryDate: string
  outcome: 'Passed' | 'Failed' | 'Conditional'
  lmo: string
  remarks?: string
}

export interface AdminInstrument {
  id: string
  type: string
  manufacturer: string
  model: string
  serialNumber: string
  capacity: string
  accuracyClass: string
  location: string
  district: string
  owner: string
  ownerGstin?: string
  ownerContact?: string
  ownerEmail?: string
  status: AdminInstrumentStatus
  lastVerification: string
  nextDue: string
  assignedLmo: string
  certificateNo?: string
  isFlagged?: boolean
  flagReason?: string
  markedForInspection?: boolean
  inspectionNotes?: string
  verificationHistory: VerificationHistoryRecord[]
}

export interface AdminOfficer {
  id: string
  name: string
  email: string
  role: string
  district: string
  activeCases: number
  phone: string
}

/* --- PART 2 TYPES --- */

export type CertificateStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Flagged'

export interface AdminCertificate {
  id: string
  certNo: string
  instrumentId: string
  instrumentType: string
  applicant: string
  location: string
  district: string
  issuedDate: string
  expiryDate: string
  issuedBy: string
  status: CertificateStatus
  isVerified?: boolean
  isFlagged?: boolean
  flagReason?: string
  sealNo?: string
  accuracyClass?: string
  history: { id: string; date: string; action: string; by: string }[]
}

export type InspectionStatusType = 'Scheduled' | 'In Progress' | 'Completed' | 'Pending Review' | 'Flagged'

export interface AdminFieldInspection {
  id: string
  instrumentId: string
  instrument: string
  applicant: string
  lmoOfficer: string
  lmoEmail?: string
  scheduledDate: string
  scheduledTime: string
  location: string
  district: string
  inspectionType: string
  status: InspectionStatusType
  isFlagged?: boolean
  flagReason?: string
  reportSummary?: {
    decision: 'PASSED' | 'FAILED' | 'FLAGGED'
    notes: string
    readings: { loadKg: number; errorKg: number; passed: boolean }[]
    photosCaptured: number
    sealVerified: boolean
  }
  history: { id: string; date: string; action: string; by: string }[]
}

export interface AdminApplicantStakeholder {
  id: string
  name: string
  organization: string
  gstin: string
  contactPerson: string
  email: string
  phone: string
  location: string
  district: string
  totalApplications: number
  totalInstruments: number
  status: 'Active' | 'Under Review' | 'Suspended'
}

export interface AdminLmoOfficerStakeholder {
  id: string
  name: string
  employeeId: string
  email: string
  phone: string
  location: string
  district: string
  currentAssignments: number
  completedInspections: number
  status: 'Active' | 'On Field Duty' | 'On Leave'
}

export interface AdminGatcOfficerStakeholder {
  id: string
  name: string
  gatcName: string
  employeeId: string
  email: string
  phone: string
  location: string
  district: string
  assignedWork: number
  completedTests: number
  status: 'Active' | 'Lab Operational'
}

export type ReportCategory =
  | 'Application Report'
  | 'Instrument Verification Report'
  | 'Inspection Report'
  | 'Certificate Report'
  | 'Officer Activity Report'
  | 'Pending Cases Report'
  | 'Expiring Certificates Report'
