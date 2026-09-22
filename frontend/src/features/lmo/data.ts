import type { AuthUser, InspectionWorkspaceData, LmoAssignment } from '../../types'

export interface LmoKpiStat {
  label: string
  value: string
  type: 'assigned' | 'due' | 'offline' | 'completed'
}

export const lmoKpiStats: LmoKpiStat[] = [
  { label: 'Assigned Today', value: '8', type: 'assigned' },
  { label: 'Due This Week', value: '23', type: 'due' },
  { label: 'Offline Sync Pending', value: '3', type: 'offline' },
  { label: 'Completed This Month', value: '46', type: 'completed' },
]

// Dynamic assignment generator based on officer jurisdiction & category authorization
export function getAssignmentsForOfficer(user?: AuthUser | null): LmoAssignment[] {
  const district = user?.jurisdiction?.district?.trim() || 'Central Zone'
  const state = user?.jurisdiction?.state?.trim() || 'State Territory'
  const officerEmail = user?.email || 'lmo@gmail.com'
  const officerName = user?.name || 'LMO Officer'

  const baseCases: LmoAssignment[] = [
    {
      id: '1',
      time: '09:00 AM',
      date: 'Today',
      applicationId: 'LM-2024-09121',
      business: 'Metro Cash & Carry',
      location: `Okhla Industrial Area, ${district}, ${state}`,
      instrument: 'Electronic Weighing Scale',
      verificationType: 'Re-verification',
      priority: 'High',
      status: 'Assigned',
      assignedOfficerEmail: officerEmail,
      assignedOfficerName: officerName,
      riskFactors: [
        {
          type: 'broken_seal',
          label: 'Previous Broken Seal',
          detail: 'This instrument has a history of broken seal (reported on 12 Aug 2024). Please verify seal integrity and record detailed photographs.',
          reportDate: '12 Aug 2024',
        },
      ],
    },
    {
      id: '2',
      time: '10:30 AM',
      date: 'Today',
      applicationId: 'LM-2024-09122',
      business: 'Bharat Petroleum Outlet',
      location: `Sector 12 Main Road, ${district}, ${state}`,
      instrument: 'Fuel Dispenser',
      verificationType: 'Re-verification',
      priority: 'Medium',
      status: 'Scheduled',
      assignedOfficerEmail: officerEmail,
      assignedOfficerName: officerName,
      riskFactors: [
        {
          type: 'repeated_failures',
          label: 'Repeated Verification Failures',
          detail: 'Dispenser calibration failed 2 consecutive tests in June & July 2024.',
          reportDate: '15 Jul 2024',
        },
      ],
    },
    {
      id: '3',
      time: '12:00 PM',
      date: 'Today',
      applicationId: 'LM-2024-09123',
      business: 'Reliance Retail Superstore',
      location: `Commercial Hub, ${district}, ${state}`,
      instrument: 'Retail Counter Scale',
      verificationType: 'Initial verification',
      priority: 'Medium',
      status: 'Inspection in progress',
      assignedOfficerEmail: officerEmail,
      assignedOfficerName: officerName,
    },
    {
      id: '4',
      time: '01:30 PM',
      date: 'Today',
      applicationId: 'LM-2024-09124',
      business: 'HP Station',
      location: `Ring Road Highway, ${district}, ${state}`,
      instrument: 'Fuel Dispenser',
      verificationType: 'After repair',
      priority: 'High',
      status: 'Assigned',
      assignedOfficerEmail: officerEmail,
      assignedOfficerName: officerName,
      riskFactors: [
        {
          type: 'previous_complaints',
          label: 'Previous Consumer Complaints',
          detail: 'Public complaint filed on National Consumer Portal regarding short delivery.',
          reportDate: '02 Sep 2024',
        },
      ],
    },
    {
      id: '5',
      time: '03:00 PM',
      date: 'Today',
      applicationId: 'LM-2024-09125',
      business: 'Grand Bazaar Wholesale',
      location: `Market Complex, ${district}, ${state}`,
      instrument: 'Weighing Scale (Retail)',
      verificationType: 'Re-verification',
      priority: 'Low',
      status: 'Scheduled',
      assignedOfficerEmail: officerEmail,
      assignedOfficerName: officerName,
    },
    {
      id: '6',
      time: '04:30 PM',
      date: 'Today',
      applicationId: 'LM-2024-09126',
      business: 'Dairy Supply Point',
      location: `Subdivision 4, ${district}, ${state}`,
      instrument: 'Milk Measuring Machine',
      verificationType: 'Special inspection',
      priority: 'Low',
      status: 'Assigned',
      assignedOfficerEmail: officerEmail,
      assignedOfficerName: officerName,
      riskFactors: [
        {
          type: 'record_mismatch',
          label: 'Manufacturer Record Mismatch',
          detail: 'Serial number MT-9912 does not match national portal import batch data.',
          reportDate: '10 Sep 2024',
        },
      ],
    },
    {
      id: '7',
      time: '09:30 AM',
      date: 'Tomorrow',
      applicationId: 'LM-2024-09130',
      business: 'Central Grain Market',
      location: `APMC Yard, ${district}, ${state}`,
      instrument: 'Heavy Duty Platform Scale',
      verificationType: 'Re-verification',
      priority: 'Medium',
      status: 'Scheduled',
      assignedOfficerEmail: officerEmail,
      assignedOfficerName: officerName,
    },
  ]

  return baseCases
}

export const lmoTodayAssignments: LmoAssignment[] = getAssignmentsForOfficer(null)

export interface ReadinessItem {
  id: string
  title: string
  subtitle: string
  type: 'gps' | 'camera' | 'download' | 'kit'
  ready: boolean
}

export const lmoReadinessItems: ReadinessItem[] = [
  {
    id: 'gps',
    title: 'Device GPS',
    subtitle: 'Ready (Accuracy ±3 m)',
    type: 'gps',
    ready: true,
  },
  {
    id: 'camera',
    title: 'Camera Permission',
    subtitle: 'Granted',
    type: 'camera',
    ready: true,
  },
  {
    id: 'download',
    title: 'Downloaded Offline Cases',
    subtitle: '3 cases (12.4 MB)',
    type: 'download',
    ready: true,
  },
  {
    id: 'kit',
    title: 'Standards Kit Status',
    subtitle: 'Checked & Calibrated',
    type: 'kit',
    ready: true,
  },
]

export function getMockWorkspaceData(assignment: LmoAssignment): InspectionWorkspaceData {
  return {
    assignment,
    applicationDetails: {
      applicationNo: assignment.applicationId,
      submittedDate: '18 Sep 2024, 10:30 AM',
      type: assignment.verificationType,
      officerAssigned: assignment.assignedOfficerName || 'LMO Officer',
      jurisdiction: assignment.location.split(', ').slice(-2).join(', '),
      feeStatus: 'Paid (₹ 1,500 - Receipt #LM-PAY-9812)',
    },
    businessDetails: {
      name: assignment.business,
      gstin: '07AAAAA0000A1Z5',
      licenseNo: 'LM-LIC-2023-9941',
      contactPerson: 'Rajesh Kumar (Operations Manager)',
      phone: '+91 98765 43210',
      email: 'contact@organisation.com',
      address: assignment.location,
    },
    instrumentSpecs: {
      type: assignment.instrument,
      manufacturer: 'Mettler Toledo / Essae',
      model: 'PX-5000 Series',
      serialNumber: 'SN-2024-88419',
      capacity: '50 kg',
      accuracyClass: 'Class III (Medium Accuracy)',
      verificationInterval: 'e = 5 g',
      minLoad: '100 g',
    },
    installationAddress: {
      locationName: assignment.business,
      addressLine: assignment.location,
      landmark: 'Near Main Gate / Meter Room',
      district: assignment.location.split(', ').slice(-2, -1)[0] || 'District Zone',
      gpsCoordinates: '28.5355° N, 77.2612° E',
    },
    previousHistory: {
      lastInspectionDate: '24 Sep 2023',
      certificateNo: 'LM-CERT-2023-09812',
      lastOfficer: 'R. K. Sharma (LMO)',
      lastOutcome: 'PASSED (Valid till 23 Sep 2024)',
      sealNumber: 'SEAL-8819',
    },
    testChecklist: [
      { id: 'c1', category: 'Visual Inspection', item: 'Level bubble centered and stable', passed: true },
      { id: 'c2', category: 'Visual Inspection', item: 'Verification stamping plate securely affixed', passed: true },
      { id: 'c3', category: 'Visual Inspection', item: 'No unauthorized modification or external wiring', passed: true },
      { id: 'c4', category: 'Seal Inspection', item: 'Lead & wire anti-fraud seal intact and tamper-free', passed: assignment.riskFactors?.every(r => r.type !== 'broken_seal') ?? true },
      { id: 'c5', category: 'Performance Check', item: 'Zero-setting device returns smoothly to zero', passed: true },
    ],
    readings: [
      { id: 'r1', loadAppliedKg: 1.0, instrumentReadingKg: 1.000, errorKg: 0.000, maxPermissibleErrorKg: 0.005, passed: true },
      { id: 'r2', loadAppliedKg: 5.0, instrumentReadingKg: 5.002, errorKg: 0.002, maxPermissibleErrorKg: 0.005, passed: true },
      { id: 'r3', loadAppliedKg: 10.0, instrumentReadingKg: 10.004, errorKg: 0.004, maxPermissibleErrorKg: 0.005, passed: true },
      { id: 'r4', loadAppliedKg: 20.0, instrumentReadingKg: 20.003, errorKg: 0.003, maxPermissibleErrorKg: 0.010, passed: true },
      { id: 'r5', loadAppliedKg: 50.0, instrumentReadingKg: 50.008, errorKg: 0.008, maxPermissibleErrorKg: 0.015, passed: true },
    ],
    gpsCapture: {
      lat: 28.5355,
      lng: 77.2612,
      accuracyMeters: 3.2,
      timestamp: new Date().toLocaleString(),
    },
    photos: {
      serialPlateUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
      sealIntactUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=80',
      fullSetupUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80',
    },
    supportingDocs: [
      { name: 'Previous_Verification_Certificate.pdf', type: 'PDF', url: '#' },
      { name: 'Purchase_Invoice_&_Model_Approval.pdf', type: 'PDF', url: '#' },
    ],
    officerObservations: 'Instrument inspected on-site. Level bubble verified. Applied standard weights up to 50kg capacity. Error values are well within Maximum Permissible Error (MPE) limits under Legal Metrology (General) Rules.',
    decision: 'PASSED',
  }
}
