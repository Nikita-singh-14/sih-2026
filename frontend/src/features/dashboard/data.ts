import type { Application, DashboardStat, Instrument, NotificationItem, UpcomingVisit } from '../../types'

export const dashboardStats: DashboardStat[] = [
  { label: 'Active instruments', value: '8,426', trend: '+8.4%', trendDirection: 'up', tone: 'blue' },
  { label: 'Pending applications', value: '248', trend: '+14 this week', trendDirection: 'neutral', tone: 'amber' },
  { label: 'Verified this month', value: '1,384', trend: '+12.6%', trendDirection: 'up', tone: 'teal' },
  { label: 'Expiring in 30 days', value: '62', trend: '-6.2%', trendDirection: 'down', tone: 'slate' },
]

export const applications: Application[] = [
  { id: 'LM-2024-08421', type: 'Re-verification', instrumentId: 'WM-DEL-01982', instrument: 'Electronic weighing scale', applicant: 'Metro Cash & Carry', submitted: 'Today, 09:42', status: 'Under review' },
  { id: 'LM-2024-08420', type: 'Initial verification', instrumentId: 'WM-DEL-01981', instrument: 'Platform scale', applicant: 'Anand Wholesale', submitted: 'Yesterday', status: 'Scheduled' },
  { id: 'LM-2024-08419', type: 'Re-verification', instrumentId: 'WM-DEL-01976', instrument: 'Fuel dispenser', applicant: 'Bharat Petroleum', submitted: '18 Sep 2024', status: 'Verified' },
  { id: 'LM-2024-08418', type: 'After repair', instrumentId: 'WM-DEL-01974', instrument: 'Retail counter scale', applicant: 'Sharma Grocers', submitted: '18 Sep 2024', status: 'Awaiting documents' },
]

export const upcomingVisits: UpcomingVisit[] = [
  { day: '24', month: 'SEP', title: 'Metro Cash & Carry', time: '10:00 AM', location: 'Okhla Phase II', officer: 'L. Mehta · LMO' },
  { day: '25', month: 'SEP', title: 'Anand Wholesale', time: '11:30 AM', location: 'Azadpur Mandi', officer: 'R. Iyer · LMO' },
  { day: '27', month: 'SEP', title: 'GATC inspection day', time: '09:00 AM', location: 'Narela Test Centre', officer: 'Team allocation pending' },
]

export const instruments: Instrument[] = [
  { id: 'WM-DEL-01982', type: 'Electronic weighing scale', manufacturer: 'A&D', model: 'GX-2000', serialNumber: 'AD2401982', location: 'Okhla Phase II', owner: 'Metro Cash & Carry', status: 'Active', nextDue: '24 Sep 2025' },
  { id: 'WM-DEL-01981', type: 'Platform scale', manufacturer: 'Essae', model: 'PB-60', serialNumber: 'ES2401981', location: 'Azadpur Mandi', owner: 'Anand Wholesale', status: 'Pending Verification', nextDue: '25 Sep 2024' },
  { id: 'WM-DEL-01976', type: 'Fuel dispenser', manufacturer: 'Gilbarco', model: 'Encore 700', serialNumber: 'GB2401976', location: 'Narela', owner: 'Bharat Petroleum', status: 'Active', nextDue: '18 Sep 2025' },
  { id: 'WM-DEL-01974', type: 'Retail counter scale', manufacturer: 'Mettler Toledo', model: ' bPlus', serialNumber: 'MT2401974', location: 'Lajpat Nagar', owner: 'Sharma Grocers', status: 'Expired', nextDue: '18 Sep 2024' },
]

export const notifications: NotificationItem[] = [
  { id: 'expiry', title: '12 certificates expire soon', detail: 'Review renewals before Friday.', unread: true },
  { id: 'assignment', title: 'New inspection assigned', detail: 'LM-2024-08420 needs scheduling.', unread: true },
  { id: 'report', title: 'Monthly report is ready', detail: 'August verification summary is available.', unread: false },
]