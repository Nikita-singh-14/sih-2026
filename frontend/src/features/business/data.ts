export interface BusinessInstrument {
  id: string
  type: string
  manufacturer: string
  model: string
  serialNumber: string
  capacity: string
  location: string
  premises: string
  status: 'Active' | 'Pending Verification' | 'Expired' | 'Under Maintenance'
  lastVerified: string
  nextDue: string
  certificateNo: string
  sealNo: string
  accuracyClass: string
}

export interface BusinessApplication {
  id: string
  applicationNo: string
  type: 'Initial verification' | 'Re-verification' | 'After repair' | 'Special inspection'
  instrumentId: string
  instrumentName: string
  location: string
  submittedDate: string
  status: 'Draft' | 'Submitted' | 'Under review' | 'Payment pending' | 'Scheduled' | 'Verified' | 'Action required'
  assignedOfficer: string
  scheduledDate?: string
  feeAmount: number
  feePaid: boolean
}

export interface BusinessCertificate {
  id: string
  certificateNo: string
  instrumentId: string
  instrumentName: string
  premises: string
  issuedDate: string
  expiryDate: string
  status: 'Valid' | 'Expiring soon' | 'Expired'
  issuedBy: string
  sealNumber: string
  qrCodeUrl: string
  downloadUrl: string
}

export interface ScheduledInspection {
  id: string
  title: string
  applicationId: string
  instrumentId: string
  premises: string
  scheduledDate: string
  timeSlot: string
  officerName: string
  officerPhone: string
  officerDesignation: string
  status: 'Scheduled' | 'En Route' | 'In Progress' | 'Completed' | 'Rescheduled'
  checklistReady: boolean
}

export interface BusinessPremises {
  id: string
  name: string
  address: string
  district: string
  managerName: string
  managerPhone: string
  activeInstrumentsCount: number
  complianceScore: number
}

export interface LicensedRepairer {
  id: string
  name: string
  licenseNo: string
  specialization: string
  phone: string
  email: string
  rating: number
}

export const initialBusinessInstruments: BusinessInstrument[] = [
  {
    id: 'WM-DEL-01982',
    type: 'Electronic Heavy Weighbridge',
    manufacturer: 'A&D Scales Ltd',
    model: 'GX-60K',
    serialNumber: 'AD2401982',
    capacity: '60 Metric Tonnes',
    location: 'Gate No 2, Heavy Freight Bay',
    premises: 'Okhla Logistics Centre Phase II',
    status: 'Active',
    lastVerified: '24 Sep 2024',
    nextDue: '24 Sep 2025',
    certificateNo: 'LM-CERT-2024-9982',
    sealNo: 'GOV-DEL-8821',
    accuracyClass: 'Class III',
  },
  {
    id: 'WM-DEL-01981',
    type: 'Digital Platform Scale',
    manufacturer: 'Essae-Teraoka',
    model: 'PB-600',
    serialNumber: 'ES2401981',
    capacity: '500 kg x 50g',
    location: 'Main Packing Floor A',
    premises: 'Azadpur Cold Storage Facility',
    status: 'Pending Verification',
    lastVerified: '25 Sep 2023',
    nextDue: '25 Sep 2024',
    certificateNo: 'LM-CERT-2023-8812',
    sealNo: 'GOV-DEL-7410',
    accuracyClass: 'Class III',
  },
  {
    id: 'WM-DEL-01976',
    type: 'Automatic Mass Flow Meter',
    manufacturer: 'Gilbarco Veeder-Root',
    model: 'Encore 700 S',
    serialNumber: 'GB2401976',
    capacity: '120 Litres/min',
    location: 'Fuel Dispensing Bay 1',
    premises: 'Narela Industrial Terminal',
    status: 'Active',
    lastVerified: '18 Sep 2024',
    nextDue: '18 Sep 2025',
    certificateNo: 'LM-CERT-2024-9176',
    sealNo: 'GOV-DEL-6549',
    accuracyClass: 'Class 0.5',
  },
  {
    id: 'WM-DEL-01974',
    type: 'High Precision Counter Scale',
    manufacturer: 'Mettler Toledo',
    model: 'bPlus-T2',
    serialNumber: 'MT2401974',
    capacity: '15 kg x 2g',
    location: 'Counter 04 - Retail Outlet',
    premises: 'Lajpat Nagar Central Depot',
    status: 'Expired',
    lastVerified: '10 Aug 2023',
    nextDue: '10 Aug 2024',
    certificateNo: 'LM-CERT-2023-6611',
    sealNo: 'GOV-DEL-4412',
    accuracyClass: 'Class II',
  },
  {
    id: 'WM-DEL-01955',
    type: 'Automatic Tank Gauging System',
    manufacturer: 'Endress+Hauser',
    model: 'Tankvision Pro',
    serialNumber: 'EH2401955',
    capacity: '50,000 Litres',
    location: 'Liquid Storage Terminal 3',
    premises: 'Narela Industrial Terminal',
    status: 'Active',
    lastVerified: '02 Jun 2024',
    nextDue: '02 Jun 2025',
    certificateNo: 'LM-CERT-2024-4419',
    sealNo: 'GOV-DEL-9081',
    accuracyClass: 'Class 0.2',
  },
]

export const initialBusinessApplications: BusinessApplication[] = [
  {
    id: 'LM-2024-08421',
    applicationNo: 'LM-2024-08421',
    type: 'Re-verification',
    instrumentId: 'WM-DEL-01982',
    instrumentName: 'Electronic Heavy Weighbridge',
    location: 'Okhla Logistics Centre Phase II',
    submittedDate: 'Today, 09:42 AM',
    status: 'Under review',
    assignedOfficer: 'L. Mehta (LMO - South Delhi)',
    scheduledDate: '28 Sep 2024',
    feeAmount: 2400,
    feePaid: true,
  },
  {
    id: 'LM-2024-08420',
    applicationNo: 'LM-2024-08420',
    type: 'Initial verification',
    instrumentId: 'WM-DEL-01981',
    instrumentName: 'Digital Platform Scale',
    location: 'Azadpur Cold Storage Facility',
    submittedDate: 'Yesterday, 04:15 PM',
    status: 'Scheduled',
    assignedOfficer: 'R. Iyer (LMO - North Delhi)',
    scheduledDate: '26 Sep 2024, 11:30 AM',
    feeAmount: 1200,
    feePaid: true,
  },
  {
    id: 'LM-2024-08419',
    applicationNo: 'LM-2024-08419',
    type: 'Re-verification',
    instrumentId: 'WM-DEL-01976',
    instrumentName: 'Automatic Mass Flow Meter',
    location: 'Narela Industrial Terminal',
    submittedDate: '18 Sep 2024',
    status: 'Verified',
    assignedOfficer: 'S. K. Verma (LMO - Narela Zone)',
    scheduledDate: '18 Sep 2024',
    feeAmount: 3500,
    feePaid: true,
  },
  {
    id: 'LM-2024-08418',
    applicationNo: 'LM-2024-08418',
    type: 'After repair',
    instrumentId: 'WM-DEL-01974',
    instrumentName: 'High Precision Counter Scale',
    location: 'Lajpat Nagar Central Depot',
    submittedDate: '15 Sep 2024',
    status: 'Action required',
    assignedOfficer: 'P. Sharma (LMO - Central Zone)',
    feeAmount: 850,
    feePaid: false,
  },
]

export const initialBusinessCertificates: BusinessCertificate[] = [
  {
    id: 'CERT-01',
    certificateNo: 'LM-CERT-2024-9982',
    instrumentId: 'WM-DEL-01982',
    instrumentName: 'Electronic Heavy Weighbridge (60T)',
    premises: 'Okhla Logistics Centre Phase II',
    issuedDate: '24 Sep 2024',
    expiryDate: '24 Sep 2025',
    status: 'Valid',
    issuedBy: 'L. Mehta, Legal Metrology Officer',
    sealNumber: 'GOV-DEL-8821',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LM-CERT-2024-9982-WM-DEL-01982',
    downloadUrl: '#download-pdf',
  },
  {
    id: 'CERT-02',
    certificateNo: 'LM-CERT-2024-9176',
    instrumentId: 'WM-DEL-01976',
    instrumentName: 'Automatic Mass Flow Meter',
    premises: 'Narela Industrial Terminal',
    issuedDate: '18 Sep 2024',
    expiryDate: '18 Sep 2025',
    status: 'Valid',
    issuedBy: 'S. K. Verma, Legal Metrology Officer',
    sealNumber: 'GOV-DEL-6549',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LM-CERT-2024-9176-WM-DEL-01976',
    downloadUrl: '#download-pdf',
  },
  {
    id: 'CERT-03',
    certificateNo: 'LM-CERT-2023-8812',
    instrumentId: 'WM-DEL-01981',
    instrumentName: 'Digital Platform Scale (500kg)',
    premises: 'Azadpur Cold Storage Facility',
    issuedDate: '25 Sep 2023',
    expiryDate: '25 Sep 2024',
    status: 'Expiring soon',
    issuedBy: 'R. Iyer, Legal Metrology Officer',
    sealNumber: 'GOV-DEL-7410',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LM-CERT-2023-8812-WM-DEL-01981',
    downloadUrl: '#download-pdf',
  },
  {
    id: 'CERT-04',
    certificateNo: 'LM-CERT-2023-6611',
    instrumentId: 'WM-DEL-01974',
    instrumentName: 'High Precision Counter Scale (15kg)',
    premises: 'Lajpat Nagar Central Depot',
    issuedDate: '10 Aug 2023',
    expiryDate: '10 Aug 2024',
    status: 'Expired',
    issuedBy: 'P. Sharma, Legal Metrology Officer',
    sealNumber: 'GOV-DEL-4412',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LM-CERT-2023-6611-WM-DEL-01974',
    downloadUrl: '#download-pdf',
  },
]

export const initialScheduledInspections: ScheduledInspection[] = [
  {
    id: 'INSP-101',
    title: 'Platform Scale Periodic Stamping & Re-verification',
    applicationId: 'LM-2024-08420',
    instrumentId: 'WM-DEL-01981',
    premises: 'Azadpur Cold Storage Facility, Gate 4',
    scheduledDate: '26 Sep 2024',
    timeSlot: '11:30 AM - 01:00 PM',
    officerName: 'R. Iyer',
    officerPhone: '+91 98712 34567',
    officerDesignation: 'Legal Metrology Officer (North Zone)',
    status: 'Scheduled',
    checklistReady: true,
  },
  {
    id: 'INSP-102',
    title: 'Weighbridge Standard Test Weight Calibration Audit',
    applicationId: 'LM-2024-08421',
    instrumentId: 'WM-DEL-01982',
    premises: 'Okhla Logistics Centre Phase II, Gate 2',
    scheduledDate: '28 Sep 2024',
    timeSlot: '10:00 AM - 12:30 PM',
    officerName: 'L. Mehta',
    officerPhone: '+91 98109 87654',
    officerDesignation: 'Senior Legal Metrology Officer (South Zone)',
    status: 'Scheduled',
    checklistReady: true,
  },
]

export const initialBusinessPremises: BusinessPremises[] = [
  {
    id: 'PREM-01',
    name: 'Okhla Logistics Centre Phase II',
    address: 'Plot 48, Okhla Industrial Area Phase II, New Delhi 110020',
    district: 'South Delhi',
    managerName: 'Vikram Singh',
    managerPhone: '+91 99100 11223',
    activeInstrumentsCount: 8,
    complianceScore: 100,
  },
  {
    id: 'PREM-02',
    name: 'Azadpur Cold Storage Facility',
    address: 'Shed C-12, Fruit & Vegetable Market, Azadpur, Delhi 110033',
    district: 'North Delhi',
    managerName: 'Rajesh Kumar',
    managerPhone: '+91 98188 44332',
    activeInstrumentsCount: 5,
    complianceScore: 80,
  },
  {
    id: 'PREM-03',
    name: 'Narela Industrial Terminal',
    address: 'Sector D-4, DSIIDC Industrial Complex, Narela, Delhi 110040',
    district: 'North West Delhi',
    managerName: 'Amit Verma',
    managerPhone: '+91 97111 55667',
    activeInstrumentsCount: 12,
    complianceScore: 95,
  },
]

export const initialLicensedRepairers: LicensedRepairer[] = [
  {
    id: 'REP-01',
    name: 'Precision Scale Care Pvt Ltd',
    licenseNo: 'LM-REP-DEL-2022-048',
    specialization: 'Heavy Weighbridges, Industrial Platform Scales & Load Cells',
    phone: '+91 98112 99001',
    email: 'service@precisionscalecare.com',
    rating: 4.9,
  },
  {
    id: 'REP-02',
    name: 'Delhi Metrology Instrument Services',
    licenseNo: 'LM-REP-DEL-2021-112',
    specialization: 'Fuel Dispensers, Flow Meters & Automatic Tank Gauging',
    phone: '+91 98733 22110',
    email: 'support@delhimetrology.in',
    rating: 4.8,
  },
]
