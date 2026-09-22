export type ApplicationStatus = 'Under review' | 'Scheduled' | 'Verified' | 'Awaiting documents'

export type Role = 'State Administrator' | 'Legal Metrology Officer' | 'GATC Officer' | 'GATC Operator' | 'Applicant / Business'

export interface Jurisdiction {
  district?: string
  state?: string
}

export interface Gatc {
  name?: string
  code?: string
  district?: string
  state?: string
}

export interface GatcProfile {
  centreName: string
  accreditationNo: string
  labAddress: string
}

export interface AuthUser {
  id?: string
  name: string
  email: string
  role: Role
  rawRole?: string
  jurisdiction?: Jurisdiction
  gatc?: Gatc
  gatcProfile?: GatcProfile
  authorizedCategories?: string[]
  workloadCapacity?: number
  currentWorkload?: number
}

export type GatcTestStatus = 'New' | 'Accepted' | 'Scheduled' | 'In Testing' | 'Report Pending' | 'Submitted to LMO' | 'Completed'
export type TestingMode = 'On-site' | 'GATC laboratory'

export type GatcScheduleStatus = 'Scheduled' | 'In Progress' | 'Awaiting Evidence' | 'Completed' | 'Failed'
export type GatcActionType = 'Open Case' | 'Start Verification' | 'Record Results' | 'Resume Test'
export type GatcDecision = 'PASSED' | 'FAILED' | 'HOLD'

export type GatcEquipmentStatus = 'Available' | 'In Use' | 'Calibration Due' | 'Under Maintenance' | 'Expired'
export type GatcResultReviewStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Returned for Correction' | 'Rejected'

export interface GatcTestEquipment {
  id: string
  equipmentId: string
  name: string
  category: string
  capacityRange: string
  calibrationDate: string
  calibrationExpiry: string
  status: GatcEquipmentStatus
  maintenanceHistory: string
  calibrationCertificate: string
  isExpired?: boolean
}

export interface GatcSubmittedResult {
  id: string
  caseId: string
  instrument: string
  result: 'PASSED' | 'FAILED' | 'HOLD'
  submittedDate: string
  reviewingAuthority: string
  reviewStatus: GatcResultReviewStatus
  remarks: string
  lmoEndorsed?: boolean
}

export interface GatcTestRequest {
  id: string
  applicationId: string
  instrumentType: string
  businessName: string
  location: string
  assignedLmo: string
  testingMode: TestingMode
  scheduledDateTime: string
  date: string
  priority: 'High' | 'Medium' | 'Low'
  status: GatcTestStatus
  notes?: string
}

export type InspectionStatus = 'Assigned' | 'Scheduled' | 'Inspection in progress' | 'Passed' | 'Failed' | 'Flagged'
export type VerificationType = 'Initial verification' | 'Re-verification' | 'After repair' | 'Special inspection'

export interface RiskFactor {
  type: 'broken_seal' | 'repeated_failures' | 'previous_complaints' | 'record_mismatch'
  label: string
  detail: string
  reportDate?: string
}

export interface LmoAssignment {
  id: string
  time: string
  date: string // e.g. '2026-09-20' or 'Today' / 'Tomorrow'
  applicationId: string
  business: string
  location: string
  instrument: string
  verificationType: VerificationType
  priority: 'High' | 'Medium' | 'Low'
  status: InspectionStatus
  assignedOfficerEmail?: string
  assignedOfficerName?: string
  riskFactors?: RiskFactor[]
}

export interface ReadingEntry {
  id: string
  loadAppliedKg: number
  instrumentReadingKg: number
  errorKg: number
  maxPermissibleErrorKg: number
  passed: boolean
}

export interface ChecklistItem {
  id: string
  category: string
  item: string
  passed: boolean
  remarks?: string
}

export interface InspectionWorkspaceData {
  assignment: LmoAssignment
  applicationDetails: {
    applicationNo: string
    submittedDate: string
    type: string
    officerAssigned: string
    jurisdiction: string
    feeStatus: string
  }
  businessDetails: {
    name: string
    gstin: string
    licenseNo: string
    contactPerson: string
    phone: string
    email: string
    address: string
  }
  instrumentSpecs: {
    type: string
    manufacturer: string
    model: string
    serialNumber: string
    capacity: string
    accuracyClass: string
    verificationInterval: string
    minLoad: string
  }
  installationAddress: {
    locationName: string
    addressLine: string
    landmark: string
    district: string
    gpsCoordinates: string
  }
  previousHistory: {
    lastInspectionDate: string
    certificateNo: string
    lastOfficer: string
    lastOutcome: string
    sealNumber: string
  }
  testChecklist: ChecklistItem[]
  readings: ReadingEntry[]
  gpsCapture: {
    lat: number
    lng: number
    accuracyMeters: number
    timestamp: string
  }
  photos: {
    serialPlateUrl?: string
    sealIntactUrl?: string
    fullSetupUrl?: string
  }
  supportingDocs: { name: string; type: string; url: string }[]
  officerObservations: string
  decision?: 'PASSED' | 'FAILED' | 'FLAGGED'
  officerSignature?: string
  businessSignature?: string
}

export interface DashboardStat {
  label: string
  value: string
  trend?: string
  trendDirection?: 'up' | 'neutral' | 'down'
  tone: 'blue' | 'teal' | 'amber' | 'slate' | 'green'
}

export interface Application {
  id: string
  type: string
  instrumentId: string
  instrument: string
  applicant: string
  location?: string
  submitted: string
  status: ApplicationStatus
}

export interface UpcomingVisit {
  day: string
  month: string
  title: string
  time: string
  location: string
  officer: string
}

export type InstrumentStatus = 'Active' | 'Pending Verification' | 'Expired' | 'Suspended'

export interface Instrument {
  id: string
  type: string
  manufacturer: string
  model: string
  serialNumber: string
  location: string
  owner: string
  status: InstrumentStatus
  nextDue: string
}

export interface NotificationItem {
  id: string
  title: string
  detail: string
  unread: boolean
}