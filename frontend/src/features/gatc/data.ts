import type { AuthUser, GatcTestRequest } from '../../types'

export interface GatcKpiStat {
  label: string
  value: string
  trend: string
  trendDirection: 'up' | 'down' | 'neutral'
  iconType: 'cases' | 'today' | 'awaiting' | 'passed'
}

export const gatcKpiStats: GatcKpiStat[] = [
  {
    label: 'Cases Allocated',
    value: '32',
    trend: '+14% vs. last week',
    trendDirection: 'up',
    iconType: 'cases',
  },
  {
    label: 'Tests Today',
    value: '7',
    trend: '+2 vs. yesterday',
    trendDirection: 'up',
    iconType: 'today',
  },
  {
    label: 'Awaiting Results',
    value: '5',
    trend: '-3 vs. yesterday',
    trendDirection: 'down',
    iconType: 'awaiting',
  },
  {
    label: 'Passed This Month',
    value: '118',
    trend: '+12% vs. last month',
    trendDirection: 'up',
    iconType: 'passed',
  },
]

export interface GatcReading {
  id: string
  loadAppliedKg: number
  instrumentReadingKg: number
  errorKg: number
  maxPermissibleErrorKg: number
  passed: boolean
}

export interface GatcChecklistItem {
  id: string
  category: string
  item: string
  passed: boolean
  remarks?: string
}

export interface GatcUploadedDoc {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
}

export interface GatcScheduleRow {
  slot: string
  caseId: string
  applicant: string
  instrument: string
  verificationType: 'Initial verification' | 'Periodic verification' | 'Re-verification' | 'Special inspection'
  status: 'Scheduled' | 'In Progress' | 'Awaiting Evidence' | 'Completed' | 'Failed'
  priority: 'High' | 'Medium' | 'Low'
  date: string
  applicationDetails: {
    applicationNo: string
    submittedDate: string
    feeStatus: string
    category: string
    jurisdiction: string
  }
  applicantDetails: {
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
    minLoad: string
    verificationInterval: string
    premisesLocation: string
  }
  previousHistory: {
    lastInspectionDate: string
    certificateNo: string
    lastOfficer: string
    lastOutcome: string
    sealNumber: string
  }
  historyLogs?: {
    date: string
    certificateNo: string
    officer: string
    outcome: string
    sealNo: string
    remarks: string
  }[]
  applicableStandard: string
  referenceEquipmentOptions: { id: string; name: string }[]
  selectedEquipmentId: string
  environmentalConditions: {
    temperatureC: number
    humidityPercent: number
    pressureHpa: number
  }
  checklist: GatcChecklistItem[]
  readings: GatcReading[]
  photos: {
    serialPlateUrl?: string
    sealIntactUrl?: string
    displayUrl?: string
    fullSetupUrl?: string
  }
  documents: GatcUploadedDoc[]
  observations: string
  decision: 'PASSED' | 'FAILED' | 'HOLD'
  signature?: string
}

export const gatcTodayScheduleRows: GatcScheduleRow[] = [
  {
    slot: '09:00 AM',
    caseId: 'TC-2024-0091',
    applicant: 'Metro Cash & Carry',
    instrument: 'Electronic weighing scale',
    verificationType: 'Initial verification',
    status: 'Scheduled',
    priority: 'High',
    date: 'Today',
    applicationDetails: {
      applicationNo: 'TC-2024-0091',
      submittedDate: '18 Sep 2026',
      feeStatus: 'Paid (₹2,400)',
      category: 'Non-Automatic Weighing Instrument (NAWI)',
      jurisdiction: 'North District, Delhi',
    },
    applicantDetails: {
      name: 'Metro Cash & Carry India Pvt Ltd',
      gstin: '07AAAAA0000A1Z5',
      licenseNo: 'LM-LIC-2024-8819',
      contactPerson: 'Arun Verma (Store Mgr)',
      phone: '+91 98101 23456',
      email: 'arun.verma@metrocash.in',
      address: 'Plot 12, Industrial Area, North District, Delhi',
    },
    instrumentSpecs: {
      type: 'Electronic weighing scale (Class III)',
      manufacturer: 'Avery India Ltd',
      model: 'AV-5000X Precision',
      serialNumber: 'SN-AVE-2026-9912',
      capacity: '50 kg',
      accuracyClass: 'Class III',
      minLoad: '100 g',
      verificationInterval: '1 Year',
      premisesLocation: 'Billing Counter #4, Main Supermarket',
    },
    previousHistory: {
      lastInspectionDate: 'N/A (New Instrument)',
      certificateNo: 'N/A',
      lastOfficer: 'N/A',
      lastOutcome: 'INITIAL ENTRY',
      sealNumber: 'N/A',
    },
    historyLogs: [
      {
        date: '18 Sep 2026',
        certificateNo: 'DRAFT-VERIF-01',
        officer: 'System Registered',
        outcome: 'PENDING GATC VERIFICATION',
        sealNo: 'PENDING',
        remarks: 'Initial application submitted for GATC verification.',
      },
    ],
    applicableStandard: 'OIML R76-1 / IS 14441:2020 Standard for Non-Automatic Weighing Instruments',
    referenceEquipmentOptions: [
      { id: 'eq-1', name: '[GATC-WT-001] NABL Class M1 Mass Standards 1mg-50kg (Calib Exp: 12 Dec 2026)' },
      { id: 'eq-2', name: '[GATC-WT-002] High-Precision Reference Weights Set (Calib Exp: 30 Nov 2026)' },
    ],
    selectedEquipmentId: 'eq-1',
    environmentalConditions: {
      temperatureC: 23.5,
      humidityPercent: 52,
      pressureHpa: 1013.2,
    },
    checklist: [
      { id: 'chk-1', category: 'Visual & Construction', item: 'Leveling indicator and adjustable feet properly aligned', passed: true, remarks: 'Verified level bubble in center.' },
      { id: 'chk-2', category: 'Visual & Construction', item: 'Manufacturer serial plate & approval mark intact', passed: true },
      { id: 'chk-3', category: 'Metrological Check', item: 'Zero-setting and tare operation within ±0.25 e', passed: true },
      { id: 'chk-4', category: 'Metrological Check', item: 'Eccentricity test (corner load check at 1/3 max capacity)', passed: true },
      { id: 'chk-5', category: 'Security Seal', item: 'Security seal housing & lead wire seal intact', passed: true },
    ],
    readings: [
      { id: 'rd-1', loadAppliedKg: 10.0, instrumentReadingKg: 10.0, errorKg: 0.0, maxPermissibleErrorKg: 0.005, passed: true },
      { id: 'rd-2', loadAppliedKg: 25.0, instrumentReadingKg: 25.002, errorKg: 0.002, maxPermissibleErrorKg: 0.005, passed: true },
      { id: 'rd-3', loadAppliedKg: 50.0, instrumentReadingKg: 50.004, errorKg: 0.004, maxPermissibleErrorKg: 0.01, passed: true },
    ],
    photos: {
      serialPlateUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
      sealIntactUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&q=80',
      displayUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=300&q=80',
      fullSetupUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80',
    },
    documents: [
      { id: 'doc-1', name: 'Manufacturer_Calibration_Cert.pdf', type: 'PDF Document', size: '1.2 MB', uploadDate: '18 Sep 2026' },
      { id: 'doc-2', name: 'GATC_Fee_Receipt_TC0091.pdf', type: 'PDF Document', size: '420 KB', uploadDate: '18 Sep 2026' },
    ],
    observations: 'Initial verification test conducted under controlled laboratory conditions. Load cell linearity and repeatability comply with Class III precision tolerances.',
    decision: 'PASSED',
  },
  {
    slot: '10:00 AM',
    caseId: 'TC-2024-0092',
    applicant: 'Anand Wholesale',
    instrument: 'Platform scale',
    verificationType: 'Periodic verification',
    status: 'In Progress',
    priority: 'Medium',
    date: 'Today',
    applicationDetails: {
      applicationNo: 'TC-2024-0092',
      submittedDate: '19 Sep 2026',
      feeStatus: 'Paid (₹3,200)',
      category: 'Industrial Heavy Platform Scale',
      jurisdiction: 'North District, Delhi',
    },
    applicantDetails: {
      name: 'Anand Wholesale Trading Co.',
      gstin: '07BBBBB1111B2Z4',
      licenseNo: 'LM-LIC-2023-4410',
      contactPerson: 'Anand Prakash (Proprietor)',
      phone: '+91 98112 88990',
      email: 'anand.wholesale@gmail.com',
      address: 'Shop 44, Grain Market, North District, Delhi',
    },
    instrumentSpecs: {
      type: 'Industrial Heavy Platform Scale (300 kg)',
      manufacturer: 'Essae-Teraoka Ltd',
      model: 'DS-215 Platform',
      serialNumber: 'SN-ESS-2024-7714',
      capacity: '300 kg',
      accuracyClass: 'Class III',
      minLoad: '500 g',
      verificationInterval: '1 Year',
      premisesLocation: 'Warehouse Loading Bay #2',
    },
    previousHistory: {
      lastInspectionDate: '15 Sep 2025',
      certificateNo: 'LM-CERT-2025-4412',
      lastOfficer: 'V. K. Singh (LMO)',
      lastOutcome: 'PASSED',
      sealNumber: 'SEAL-DEL-88192',
    },
    applicableStandard: 'IS 14441:2020 Standards for Industrial Weighing Systems',
    referenceEquipmentOptions: [
      { id: 'eq-1', name: '[GATC-WT-001] NABL Class M1 Mass Standards 1mg-50kg (Calib Exp: 12 Dec 2026)' },
      { id: 'eq-3', name: '[GATC-WT-003] Heavy Platform Test Weight Rig (Calib Exp: 15 Jan 2027)' },
    ],
    selectedEquipmentId: 'eq-3',
    environmentalConditions: {
      temperatureC: 24.1,
      humidityPercent: 55,
      pressureHpa: 1012.8,
    },
    checklist: [
      { id: 'chk-1', category: 'Visual & Construction', item: 'Platform structure free of mechanical deformation', passed: true },
      { id: 'chk-2', category: 'Metrological Check', item: 'Linearity test up to 300 kg capacity', passed: true, remarks: 'Minor error at 150kg within MPE limit.' },
      { id: 'chk-3', category: 'Security Seal', item: 'Verification seal wire intact', passed: true },
    ],
    readings: [
      { id: 'rd-1', loadAppliedKg: 50.0, instrumentReadingKg: 50.0, errorKg: 0.0, maxPermissibleErrorKg: 0.05, passed: true },
      { id: 'rd-2', loadAppliedKg: 150.0, instrumentReadingKg: 150.03, errorKg: 0.03, maxPermissibleErrorKg: 0.05, passed: true },
      { id: 'rd-3', loadAppliedKg: 300.0, instrumentReadingKg: 300.04, errorKg: 0.04, maxPermissibleErrorKg: 0.1, passed: true },
    ],
    photos: {
      serialPlateUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
      sealIntactUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&q=80',
    },
    documents: [
      { id: 'doc-1', name: 'Previous_Cert_2025.pdf', type: 'PDF Document', size: '980 KB', uploadDate: '19 Sep 2026' },
    ],
    observations: 'Periodic calibration testing underway. Scale platform verified for zero drift and corner loading.',
    decision: 'PASSED',
  },
  {
    slot: '11:00 AM',
    caseId: 'TC-2024-0093',
    applicant: 'Sharma Grocers',
    instrument: 'Retail counter scale',
    verificationType: 'Re-verification',
    status: 'Awaiting Evidence',
    priority: 'High',
    date: 'Today',
    applicationDetails: {
      applicationNo: 'TC-2024-0093',
      submittedDate: '15 Sep 2026',
      feeStatus: 'Paid (₹1,800)',
      category: 'Retail Counter Scale',
      jurisdiction: 'North District, Delhi',
    },
    applicantDetails: {
      name: 'Sharma Grocers & Provisions',
      gstin: '07CCCCC2222C3Z3',
      licenseNo: 'LM-LIC-2024-1102',
      contactPerson: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      email: 'sharma.grocers@outlook.com',
      address: '14 Bazaar Road, North District, Delhi',
    },
    instrumentSpecs: {
      type: 'Electronic Retail Scale (15 kg)',
      manufacturer: 'CAS India Ltd',
      model: 'PR-II Counter',
      serialNumber: 'SN-CAS-2025-1192',
      capacity: '15 kg',
      accuracyClass: 'Class III',
      minLoad: '40 g',
      verificationInterval: '1 Year',
      premisesLocation: 'Billing Counter #1',
    },
    previousHistory: {
      lastInspectionDate: '10 Aug 2025',
      certificateNo: 'LM-CERT-2025-1182',
      lastOfficer: 'P. V. Iyer (LMO)',
      lastOutcome: 'FAILED (Seal Broken)',
      sealNumber: 'BROKEN-SEAL-REPAIR',
    },
    applicableStandard: 'OIML R76-1 Precision Retail Tolerances',
    referenceEquipmentOptions: [
      { id: 'eq-1', name: '[GATC-WT-001] NABL Class M1 Mass Standards 1mg-50kg (Calib Exp: 12 Dec 2026)' },
    ],
    selectedEquipmentId: 'eq-1',
    environmentalConditions: {
      temperatureC: 22.8,
      humidityPercent: 50,
      pressureHpa: 1014.0,
    },
    checklist: [
      { id: 'chk-1', category: 'Visual & Construction', item: 'Housing intact without tamper marks', passed: true },
      { id: 'chk-2', category: 'Security Seal', item: 'Repair certificate attached from authorized service technician', passed: false, remarks: 'Awaiting repair certificate copy.' },
    ],
    readings: [
      { id: 'rd-1', loadAppliedKg: 5.0, instrumentReadingKg: 5.0, errorKg: 0.0, maxPermissibleErrorKg: 0.002, passed: true },
      { id: 'rd-2', loadAppliedKg: 15.0, instrumentReadingKg: 15.001, errorKg: 0.001, maxPermissibleErrorKg: 0.005, passed: true },
    ],
    photos: {
      serialPlateUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
    },
    documents: [],
    observations: 'Physical verification test passed. Awaiting submission of repair technician invoice and seal replacement authorization before final sign-off.',
    decision: 'HOLD',
  },
  {
    slot: '12:00 PM',
    caseId: 'TC-2024-0094',
    applicant: 'Bharat Petroleum',
    instrument: 'Fuel dispenser',
    verificationType: 'Initial verification',
    status: 'Scheduled',
    priority: 'High',
    date: 'Today',
    applicationDetails: {
      applicationNo: 'TC-2024-0094',
      submittedDate: '19 Sep 2026',
      feeStatus: 'Paid (₹5,000)',
      category: 'Volumetric Fuel Metering System',
      jurisdiction: 'North District, Delhi',
    },
    applicantDetails: {
      name: 'Bharat Petroleum Retail Outlet',
      gstin: '07DDDDD3333D4Z2',
      licenseNo: 'LM-LIC-2024-9901',
      contactPerson: 'Sanjay Gupta (Station Mgr)',
      phone: '+91 98111 55443',
      email: 'sanjay.gupta@bpcl.in',
      address: 'NH-44 Highway Outlet, North District, Delhi',
    },
    instrumentSpecs: {
      type: 'Multi-Nozzle Fuel Dispensing Pump',
      manufacturer: 'Gilbarco Veeder-Root',
      model: 'Encore 500S',
      serialNumber: 'SN-GIL-2026-3391',
      capacity: '50 L/min',
      accuracyClass: 'Class 0.5',
      minLoad: '2 L',
      verificationInterval: '1 Year',
      premisesLocation: 'Pump Island #3 (Diesel & Petrol)',
    },
    previousHistory: {
      lastInspectionDate: 'N/A (New Dispenser Installation)',
      certificateNo: 'N/A',
      lastOfficer: 'N/A',
      lastOutcome: 'NEW INSTALLATION',
      sealNumber: 'N/A',
    },
    applicableStandard: 'OIML R117 Volumetric Measuring Systems for Liquids Other Than Water',
    referenceEquipmentOptions: [
      { id: 'eq-4', name: '[GATC-TK-001] NABL 5L & 20L Standard Proving Cans (Calib Exp: 05 Jan 2027)' },
    ],
    selectedEquipmentId: 'eq-4',
    environmentalConditions: {
      temperatureC: 25.0,
      humidityPercent: 48,
      pressureHpa: 1012.0,
    },
    checklist: [
      { id: 'chk-1', category: 'Visual & Construction', item: 'Totalizer meter counter & anti-drain valve', passed: true },
      { id: 'chk-2', category: 'Volumetric Check', item: '5L proving measure check within ±25 ml tolerance', passed: true },
    ],
    readings: [
      { id: 'rd-1', loadAppliedKg: 5.0, instrumentReadingKg: 5.01, errorKg: 0.01, maxPermissibleErrorKg: 0.025, passed: true },
      { id: 'rd-2', loadAppliedKg: 20.0, instrumentReadingKg: 20.02, errorKg: 0.02, maxPermissibleErrorKg: 0.1, passed: true },
    ],
    photos: {
      displayUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=300&q=80',
    },
    documents: [
      { id: 'doc-1', name: 'Dispenser_PESO_Approval.pdf', type: 'PDF Document', size: '2.4 MB', uploadDate: '19 Sep 2026' },
    ],
    observations: 'Initial verification appointment scheduled for volumetric proving measure using 5L and 20L NABL calibrated proving cans.',
    decision: 'PASSED',
  },
  {
    slot: '02:00 PM',
    caseId: 'TC-2024-0095',
    applicant: 'S.K. Enterprises',
    instrument: 'Weighbridge',
    verificationType: 'Periodic verification',
    status: 'Scheduled',
    priority: 'Low',
    date: 'Today',
    applicationDetails: {
      applicationNo: 'TC-2024-0095',
      submittedDate: '17 Sep 2026',
      feeStatus: 'Paid (₹8,500)',
      category: 'Heavy Pitless Road Weighbridge (60 Ton)',
      jurisdiction: 'North District, Delhi',
    },
    applicantDetails: {
      name: 'S.K. Enterprises Logistics Ltd',
      gstin: '07EEEEE4444E5Z1',
      licenseNo: 'LM-LIC-2022-7712',
      contactPerson: 'Sunil Kumar',
      phone: '+91 98222 11009',
      email: 'sk.logistics@skenterprises.com',
      address: 'Freight Hub, Ring Road, North District, Delhi',
    },
    instrumentSpecs: {
      type: 'Pitless Heavy Road Weighbridge (60T)',
      manufacturer: 'Leoweigh Systems',
      model: 'LW-60T Pitless',
      serialNumber: 'SN-LEO-2022-5519',
      capacity: '60,000 kg',
      accuracyClass: 'Class III',
      minLoad: '400 kg',
      verificationInterval: '1 Year',
      premisesLocation: 'Inward Goods Gate #1',
    },
    previousHistory: {
      lastInspectionDate: '18 Sep 2025',
      certificateNo: 'LM-CERT-2025-9012',
      lastOfficer: 'S. N. Mehta (LMO)',
      lastOutcome: 'PASSED',
      sealNumber: 'SEAL-DEL-77123',
    },
    applicableStandard: 'IS 14441:2020 Standards for Pitless Weighbridge Systems',
    referenceEquipmentOptions: [
      { id: 'eq-5', name: '[GATC-WT-005] 10-Ton Test Mass Vehicle & Test Blocks (Calib Exp: 20 Dec 2026)' },
    ],
    selectedEquipmentId: 'eq-5',
    environmentalConditions: {
      temperatureC: 26.2,
      humidityPercent: 45,
      pressureHpa: 1011.5,
    },
    checklist: [
      { id: 'chk-1', category: 'Visual & Construction', item: 'Platform clearance & load cell mounting intact', passed: true },
    ],
    readings: [
      { id: 'rd-1', loadAppliedKg: 10000, instrumentReadingKg: 10002, errorKg: 2, maxPermissibleErrorKg: 10, passed: true },
      { id: 'rd-2', loadAppliedKg: 30000, instrumentReadingKg: 30005, errorKg: 5, maxPermissibleErrorKg: 15, passed: true },
    ],
    photos: {},
    documents: [],
    observations: 'On-site periodic verification scheduled with 10-ton standard test weight vehicle.',
    decision: 'PASSED',
  },
  {
    slot: '03:00 PM',
    caseId: 'TC-2024-0096',
    applicant: 'Narela Mandi',
    instrument: 'Electronic weighing scale',
    verificationType: 'Re-verification',
    status: 'Completed',
    priority: 'High',
    date: 'Today',
    applicationDetails: {
      applicationNo: 'TC-2024-0096',
      submittedDate: '16 Sep 2026',
      feeStatus: 'Paid (₹2,400)',
      category: 'Commercial Grain Scale',
      jurisdiction: 'North District, Delhi',
    },
    applicantDetails: {
      name: 'Narela Mandi Grain Association',
      gstin: '07FFFFF5555F6Z0',
      licenseNo: 'LM-LIC-2024-3310',
      contactPerson: 'Mahesh Chand',
      phone: '+91 98333 44556',
      email: 'mandi.narela@gov.in',
      address: 'Central Yard, Narela Mandi, Delhi',
    },
    instrumentSpecs: {
      type: 'Electronic Bench Scale (100 kg)',
      manufacturer: 'Phoenix Scales',
      model: 'PX-100 Heavy',
      serialNumber: 'SN-PHX-2025-4491',
      capacity: '100 kg',
      accuracyClass: 'Class III',
      minLoad: '200 g',
      verificationInterval: '1 Year',
      premisesLocation: 'Gate #3 Auction Platform',
    },
    previousHistory: {
      lastInspectionDate: '10 Sep 2025',
      certificateNo: 'LM-CERT-2025-6612',
      lastOfficer: 'R. K. Sharma (LMO)',
      lastOutcome: 'PASSED',
      sealNumber: 'SEAL-DEL-44102',
    },
    applicableStandard: 'OIML R76-1 Commercial Weighing Tolerances',
    referenceEquipmentOptions: [
      { id: 'eq-1', name: '[GATC-WT-001] NABL Class M1 Mass Standards 1mg-50kg (Calib Exp: 12 Dec 2026)' },
    ],
    selectedEquipmentId: 'eq-1',
    environmentalConditions: {
      temperatureC: 24.0,
      humidityPercent: 51,
      pressureHpa: 1013.0,
    },
    checklist: [
      { id: 'chk-1', category: 'Visual & Construction', item: 'Leveling & zero-setting check', passed: true },
      { id: 'chk-2', category: 'Metrological Check', item: 'Corner load & full load test', passed: true },
    ],
    readings: [
      { id: 'rd-1', loadAppliedKg: 20.0, instrumentReadingKg: 20.0, errorKg: 0.0, maxPermissibleErrorKg: 0.01, passed: true },
      { id: 'rd-2', loadAppliedKg: 100.0, instrumentReadingKg: 100.01, errorKg: 0.01, maxPermissibleErrorKg: 0.02, passed: true },
    ],
    photos: {
      serialPlateUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
      sealIntactUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&q=80',
    },
    documents: [
      { id: 'doc-1', name: 'Narela_Test_Report_Final.pdf', type: 'PDF Document', size: '1.5 MB', uploadDate: '20 Sep 2026' },
    ],
    observations: 'Verification testing completed successfully. GATC verification seal #SEAL-GATC-2026-991 applied.',
    decision: 'PASSED',
  },
  {
    slot: '04:00 PM',
    caseId: 'TC-2024-0097',
    applicant: 'Ahuja Traders',
    instrument: 'Platform scale',
    verificationType: 'Special inspection',
    status: 'Failed',
    priority: 'Low',
    date: 'Today',
    applicationDetails: {
      applicationNo: 'TC-2024-0097',
      submittedDate: '14 Sep 2026',
      feeStatus: 'Paid (₹2,000)',
      category: 'Platform Scale',
      jurisdiction: 'North District, Delhi',
    },
    applicantDetails: {
      name: 'Ahuja Traders',
      gstin: '07GGGGG6666G7Z9',
      licenseNo: 'LM-LIC-2024-0091',
      contactPerson: 'Suresh Ahuja',
      phone: '+91 98444 55667',
      email: 'ahuja.traders@gmail.com',
      address: '22 Industrial Estate, North District, Delhi',
    },
    instrumentSpecs: {
      type: 'Platform Scale (150 kg)',
      manufacturer: 'Local Assembler',
      model: 'PS-150',
      serialNumber: 'SN-AHU-2024-001',
      capacity: '150 kg',
      accuracyClass: 'Class III',
      minLoad: '500 g',
      verificationInterval: '1 Year',
      premisesLocation: 'Dispatch Bay',
    },
    previousHistory: {
      lastInspectionDate: '05 Aug 2025',
      certificateNo: 'LM-CERT-2025-0011',
      lastOfficer: 'P. V. Iyer (LMO)',
      lastOutcome: 'FAILED',
      sealNumber: 'TAMPERED-SEAL',
    },
    applicableStandard: 'OIML R76-1 Non-Automatic Weighing Instruments',
    referenceEquipmentOptions: [
      { id: 'eq-1', name: '[GATC-WT-001] NABL Class M1 Mass Standards 1mg-50kg (Calib Exp: 12 Dec 2026)' },
    ],
    selectedEquipmentId: 'eq-1',
    environmentalConditions: {
      temperatureC: 25.5,
      humidityPercent: 54,
      pressureHpa: 1012.2,
    },
    checklist: [
      { id: 'chk-1', category: 'Metrological Check', item: 'Linearity load test', passed: false, remarks: 'Exceeds MPE tolerance by +0.35kg at 100kg load.' },
    ],
    readings: [
      { id: 'rd-1', loadAppliedKg: 50.0, instrumentReadingKg: 50.12, errorKg: 0.12, maxPermissibleErrorKg: 0.05, passed: false },
      { id: 'rd-2', loadAppliedKg: 100.0, instrumentReadingKg: 100.35, errorKg: 0.35, maxPermissibleErrorKg: 0.05, passed: false },
    ],
    photos: {
      serialPlateUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
    },
    documents: [],
    observations: 'Scale failed linearity and load test tolerances. Load cell recalibration or replacement required before re-testing.',
    decision: 'FAILED',
  },
]

export interface CentreReadinessItem {
  id: string
  title: string
  subtext: string
  status: string
  statusType: 'valid' | 'available' | 'online' | 'warning' | 'neutral'
  iconType: 'weights' | 'bench' | 'camera' | 'certificate' | 'expiry' | 'maintenance'
}

export const centreReadinessItems: CentreReadinessItem[] = [
  {
    id: 'readiness-1',
    title: 'Reference weights calibrated',
    subtext: 'Last calibrated: 12 Sep 2024',
    status: 'Valid',
    statusType: 'valid',
    iconType: 'weights',
  },
  {
    id: 'readiness-2',
    title: 'Test bench availability',
    subtext: 'Bench 1 online & ready',
    status: 'Available',
    statusType: 'available',
    iconType: 'bench',
  },
  {
    id: 'readiness-3',
    title: 'Camera readiness',
    subtext: 'Live verification feed active',
    status: 'Online',
    statusType: 'online',
    iconType: 'camera',
  },
  {
    id: 'readiness-4',
    title: 'Centre approval validity',
    subtext: 'NABL Accredited until 30 Nov 2026',
    status: 'Valid',
    statusType: 'valid',
    iconType: 'certificate',
  },
  {
    id: 'readiness-5',
    title: 'Equipment calibration expiry',
    subtext: '[EQ-WT-004] Expired on 10 Sep 2026',
    status: '1 Item Due',
    statusType: 'warning',
    iconType: 'expiry',
  },
  {
    id: 'readiness-6',
    title: 'Pending maintenance',
    subtext: 'All test benches operational',
    status: '0 Pending',
    statusType: 'neutral',
    iconType: 'maintenance',
  },
]

export const gatcEquipmentList = [
  {
    id: 'eq-1',
    equipmentId: 'EQ-WT-001',
    name: 'NABL Class M1 Mass Standards Set (1mg-50kg)',
    category: 'Mass Standards',
    capacityRange: '1 mg – 50 kg',
    calibrationDate: '12 Dec 2024',
    calibrationExpiry: '12 Dec 2026',
    status: 'Available' as const,
    maintenanceHistory: 'Cleaned & re-zeroed on 01 Aug 2026; last NABL overhaul 12 Dec 2024.',
    calibrationCertificate: 'NABL-CERT-2024-99812.pdf',
    isExpired: false,
  },
  {
    id: 'eq-2',
    equipmentId: 'EQ-TK-002',
    name: 'NABL 5L & 20L Standard Proving Cans',
    category: 'Volumetric Measure',
    capacityRange: '5 L – 20 L',
    calibrationDate: '05 Jan 2025',
    calibrationExpiry: '05 Jan 2027',
    status: 'In Use' as const,
    maintenanceHistory: 'Volumetric meniscus check passed 05 Jan 2025.',
    calibrationCertificate: 'NABL-CERT-2025-44102.pdf',
    isExpired: false,
  },
  {
    id: 'eq-3',
    equipmentId: 'EQ-MB-003',
    name: 'Digital Precision Test Bench Rig',
    category: 'Bench & Load Cell Rig',
    capacityRange: '0.1 g – 300 kg',
    calibrationDate: '15 Nov 2024',
    calibrationExpiry: '15 Oct 2026',
    status: 'Calibration Due' as const,
    maintenanceHistory: 'Scheduled for NABL re-calibration on 15 Oct 2026.',
    calibrationCertificate: 'NABL-CERT-2024-11029.pdf',
    isExpired: false,
  },
  {
    id: 'eq-4',
    equipmentId: 'EQ-WT-004',
    name: 'Heavy Mass Proving Standard (500 kg)',
    category: 'Heavy Mass Standard',
    capacityRange: '500 kg',
    calibrationDate: '10 Sep 2024',
    calibrationExpiry: '10 Sep 2026',
    status: 'Expired' as const,
    maintenanceHistory: 'Calibration expired on 10 Sep 2026. Sealed out of service pending re-calibration.',
    calibrationCertificate: 'NABL-CERT-2024-00192.pdf',
    isExpired: true,
  },
  {
    id: 'eq-5',
    equipmentId: 'EQ-VH-005',
    name: '10-Ton Weighbridge Test Mass Vehicle',
    category: 'Heavy Test Vehicle',
    capacityRange: '10,000 kg',
    calibrationDate: '20 Dec 2024',
    calibrationExpiry: '20 Dec 2026',
    status: 'Under Maintenance' as const,
    maintenanceHistory: 'Hydraulic axle servicing & mass block alignment in progress.',
    calibrationCertificate: 'NABL-CERT-2024-77182.pdf',
    isExpired: false,
  },
]

export const gatcSubmittedResultsList = [
  {
    id: 'sub-1',
    caseId: 'TC-2024-0091',
    instrument: 'Electronic weighing scale',
    result: 'PASSED' as const,
    submittedDate: 'Today, 09:45 AM',
    reviewingAuthority: 'R. K. Sharma (Senior LMO)',
    reviewStatus: 'Approved' as const,
    remarks: 'Technical report verified. Senior LMO endorsed legal metrology certificate LM-CERT-2026-9901.',
    lmoEndorsed: true,
  },
  {
    id: 'sub-2',
    caseId: 'TC-2024-0092',
    instrument: 'Platform scale',
    result: 'PASSED' as const,
    submittedDate: 'Today, 10:50 AM',
    reviewingAuthority: 'P. V. Iyer (LMO)',
    reviewStatus: 'Under Review' as const,
    remarks: 'Technical report submitted to LMO. Final certificate decision pending LMO review.',
    lmoEndorsed: false,
  },
  {
    id: 'sub-3',
    caseId: 'TC-2024-0093',
    instrument: 'Retail counter scale',
    result: 'HOLD' as const,
    submittedDate: 'Today, 11:45 AM',
    reviewingAuthority: 'S. N. Mehta (LMO)',
    reviewStatus: 'Returned for Correction' as const,
    remarks: 'Returned by LMO: Please upload authorized repair technician invoice copy.',
    lmoEndorsed: false,
  },
  {
    id: 'sub-4',
    caseId: 'TC-2024-0094',
    instrument: 'Fuel dispenser',
    result: 'PASSED' as const,
    submittedDate: 'Yesterday, 04:30 PM',
    reviewingAuthority: 'R. K. Sharma (Senior LMO)',
    reviewStatus: 'Submitted' as const,
    remarks: 'Submitted to LMO for final certificate issuance approval.',
    lmoEndorsed: false,
  },
  {
    id: 'sub-5',
    caseId: 'TC-2024-0096',
    instrument: 'Electronic weighing scale',
    result: 'PASSED' as const,
    submittedDate: 'Today, 03:20 PM',
    reviewingAuthority: 'S. N. Mehta (LMO)',
    reviewStatus: 'Draft' as const,
    remarks: 'Draft report saved by GATC Officer. Pending submission.',
    lmoEndorsed: false,
  },
  {
    id: 'sub-6',
    caseId: 'TC-2024-0097',
    instrument: 'Platform scale',
    result: 'FAILED' as const,
    submittedDate: 'Yesterday, 05:15 PM',
    reviewingAuthority: 'P. V. Iyer (LMO)',
    reviewStatus: 'Rejected' as const,
    remarks: 'Verification failed. Linearity error exceeded MPE by +0.35kg. Repair required.',
    lmoEndorsed: false,
  },
]

export const gatcReportsData = {
  totalAllocated: 32,
  passPercentage: 94.2,
  failPercentage: 5.8,
  avgCompletionMins: 42,
  pendingTests: 5,
  equipmentUtilisation: 86,
  officerPerformance: [
    { name: 'Vikram Singh (GATC Officer)', testsCompleted: 18, passRate: '94.4%', avgTurnaround: '38 mins' },
    { name: 'Ananya Roy (GATC Operator)', testsCompleted: 14, passRate: '92.8%', avgTurnaround: '46 mins' },
  ],
  monthlyTrend: [
    { month: 'Jan', count: 22 },
    { month: 'Feb', count: 26 },
    { month: 'Mar', count: 31 },
    { month: 'Apr', count: 28 },
    { month: 'May', count: 34 },
    { month: 'Jun', count: 30 },
    { month: 'Jul', count: 36 },
    { month: 'Aug', count: 35 },
    { month: 'Sep', count: 32 },
  ],
}

export function getGatcTestRequests(user?: AuthUser | null): GatcTestRequest[] {
  const district = user?.gatc?.district || user?.jurisdiction?.district?.trim() || 'Central District'
  const state = user?.gatc?.state || user?.jurisdiction?.state?.trim() || 'State Region'

  return [
    {
      id: 'gatc-1',
      applicationId: 'TC-2024-0091',
      instrumentType: 'Electronic weighing scale',
      businessName: 'Metro Cash & Carry',
      location: `Commercial Hub, ${district}, ${state}`,
      assignedLmo: 'R. K. Sharma (LMO)',
      testingMode: 'GATC laboratory',
      scheduledDateTime: 'Today, 09:00 AM',
      date: 'Today',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Initial verification under Class III precision standards.',
    },
    {
      id: 'gatc-2',
      applicationId: 'TC-2024-0092',
      instrumentType: 'Platform scale',
      businessName: 'Anand Wholesale',
      location: `Wholesale Market, ${district}, ${state}`,
      assignedLmo: 'P. V. Iyer (LMO)',
      testingMode: 'GATC laboratory',
      scheduledDateTime: 'Today, 10:00 AM',
      date: 'Today',
      priority: 'Medium',
      status: 'In Testing',
      notes: 'Periodic verification in progress. Linearity test under load cell standards.',
    },
    {
      id: 'gatc-3',
      applicationId: 'TC-2024-0093',
      instrumentType: 'Retail counter scale',
      businessName: 'Sharma Grocers',
      location: `Main Bazaar, ${district}, ${state}`,
      assignedLmo: 'S. N. Mehta (LMO)',
      testingMode: 'GATC laboratory',
      scheduledDateTime: 'Today, 11:00 AM',
      date: 'Today',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'Re-verification after routine maintenance.',
    },
    {
      id: 'gatc-4',
      applicationId: 'TC-2024-0094',
      instrumentType: 'Fuel dispenser',
      businessName: 'Bharat Petroleum',
      location: `Highway Junction, ${district}, ${state}`,
      assignedLmo: 'R. K. Sharma (LMO)',
      testingMode: 'On-site',
      scheduledDateTime: 'Today, 12:00 PM',
      date: 'Today',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Flow rate & volumetric error measurement.',
    },
    {
      id: 'gatc-5',
      applicationId: 'TC-2024-0095',
      instrumentType: 'Weighbridge',
      businessName: 'S.K. Enterprises',
      location: `Freight Terminal, ${district}, ${state}`,
      assignedLmo: 'P. V. Iyer (LMO)',
      testingMode: 'On-site',
      scheduledDateTime: 'Today, 02:00 PM',
      date: 'Today',
      priority: 'Low',
      status: 'Scheduled',
      notes: '60T weighbridge periodic verification.',
    },
    {
      id: 'gatc-6',
      applicationId: 'TC-2024-0096',
      instrumentType: 'Electronic weighing scale',
      businessName: 'Narela Mandi',
      location: `Grain Market, ${district}, ${state}`,
      assignedLmo: 'S. N. Mehta (LMO)',
      testingMode: 'GATC laboratory',
      scheduledDateTime: 'Today, 03:00 PM',
      date: 'Today',
      priority: 'High',
      status: 'Report Pending',
      notes: 'Test completed. Pending report submission.',
    },
    {
      id: 'gatc-7',
      applicationId: 'TC-2024-0097',
      instrumentType: 'Platform scale',
      businessName: 'Ahuja Traders',
      location: `Industrial Area, ${district}, ${state}`,
      assignedLmo: 'R. K. Sharma (LMO)',
      testingMode: 'GATC laboratory',
      scheduledDateTime: 'Today, 04:00 PM',
      date: 'Today',
      priority: 'Low',
      status: 'Scheduled',
      notes: 'Initial verification for new retail store scale.',
    },
  ]
}

export interface GatcAllocationEvaluationResult {
  eligible: boolean
  rules: {
    rule1_activeApproval: { passed: boolean; label: string; detail: string }
    rule2_validExpiry: { passed: boolean; label: string; detail: string }
    rule3_authorizedCategory: { passed: boolean; label: string; detail: string }
    rule4_calibratedEquipment: { passed: boolean; label: string; detail: string }
    rule5_serviceJurisdiction: { passed: boolean; label: string; detail: string }
    rule6_workloadCapacity: { passed: boolean; label: string; detail: string }
  }
}

export function evaluateGatcAllocation(
  caseData: {
    caseId: string
    category: string
    locationDistrict: string
    locationState: string
    requiredEquipmentCategory?: string
  },
  userGatc?: AuthUser['gatc']
): GatcAllocationEvaluationResult {
  const currentDate = '2026-09-20'
  const gatcStatus = 'ACTIVE'
  const approvalExpiry = '2026-11-30'
  const userDistrict = userGatc?.district || 'North District'
  const userState = userGatc?.state || 'Delhi'
  const authorizedCategories = ['Electronic weighing scale', 'Platform scale', 'Retail counter scale', 'Fuel dispenser', 'Weighbridge', 'Non-Automatic Weighing Instrument (NAWI)']
  const currentWorkload = 7
  const maxCapacity = 15

  const isApprovedAndActive = gatcStatus === 'ACTIVE'
  const isApprovalValid = approvalExpiry >= currentDate
  const isCategoryAuthorized = authorizedCategories.some(
    (cat) => cat.toLowerCase().includes(caseData.category.toLowerCase()) || caseData.category.toLowerCase().includes(cat.toLowerCase())
  )
  const isCalibratedEquipmentAvailable = true
  const isJurisdictionMatch =
    caseData.locationDistrict.toLowerCase().trim() === userDistrict.toLowerCase().trim() &&
    caseData.locationState.toLowerCase().trim() === userState.toLowerCase().trim()
  const isWorkloadCapacityAvailable = currentWorkload < maxCapacity

  const eligible =
    isApprovedAndActive &&
    isApprovalValid &&
    isCategoryAuthorized &&
    isCalibratedEquipmentAvailable &&
    isJurisdictionMatch &&
    isWorkloadCapacityAvailable

  return {
    eligible,
    rules: {
      rule1_activeApproval: {
        passed: isApprovedAndActive,
        label: '1. Government Approved & Active Status',
        detail: `Centre Status: ${gatcStatus}`,
      },
      rule2_validExpiry: {
        passed: isApprovalValid,
        label: '2. Unexpired Approval Validity',
        detail: `Approval Valid until ${approvalExpiry}`,
      },
      rule3_authorizedCategory: {
        passed: isCategoryAuthorized,
        label: '3. Instrument Category Authorization Scope',
        detail: `Scope Authorized for: "${caseData.category}"`,
      },
      rule4_calibratedEquipment: {
        passed: isCalibratedEquipmentAvailable,
        label: '4. Calibrated Reference Equipment Available',
        detail: isCalibratedEquipmentAvailable ? 'NABL Standard Mass & Proving Cans Valid' : 'Required Equipment Calibration Expired',
      },
      rule5_serviceJurisdiction: {
        passed: isJurisdictionMatch,
        label: '5. Service Jurisdiction Match (State & District)',
        detail: `${caseData.locationDistrict}, ${caseData.locationState} ${isJurisdictionMatch ? '(Matches Centre)' : '(Outside Jurisdiction)'}`,
      },
      rule6_workloadCapacity: {
        passed: isWorkloadCapacityAvailable,
        label: '6. Centre Workload Capacity Available',
        detail: `${currentWorkload}/${maxCapacity} Active Cases Allocated`,
      },
    },
  }
}

// Security Check helper for cross-centre case access simulation
export const foreignCentreCases: Record<string, { caseId: string; centreName: string; gatcCode: string; district: string; state: string; instrument: string }> = {
  'TC-MUM-9901': {
    caseId: 'TC-MUM-9901',
    centreName: 'Mumbai Standard Testing Laboratory',
    gatcCode: 'GATC-MUM-09',
    district: 'Mumbai City',
    state: 'Maharashtra',
    instrument: 'High Precision Diamond Scale',
  },
  'TC-BLR-8812': {
    caseId: 'TC-BLR-8812',
    centreName: 'Bangalore Regional Metrology Centre',
    gatcCode: 'GATC-BLR-03',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    instrument: 'Flow Meter Rig',
  },
}

