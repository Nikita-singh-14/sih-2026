export type ApplicationStatus = 'Under review' | 'Scheduled' | 'Verified' | 'Awaiting documents'

export type Role = 'State Administrator' | 'Legal Metrology Officer' | 'GATC Operator' | 'Applicant / Business'

export interface DashboardStat {
  label: string
  value: string
  trend: string
  trendDirection: 'up' | 'neutral' | 'down'
  tone: 'blue' | 'teal' | 'amber' | 'slate'
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