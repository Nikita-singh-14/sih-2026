import { PrismaClient, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const defaultPassword = await hash('password123', 12)

  console.log('Seeding demo accounts and business workspace...')

  // 1. Create or update Organisation for Business Applicant
  const org = await prisma.organisation.upsert({
    where: { id: 'ORG-APEX-LOGISTICS' },
    update: {
      name: 'Apex Logistics & Freight Hub',
      email: 'business@company.com',
      phone: '+91 99100 11223',
      gstin: '07AAACM4821K1Z5',
      lmRegistrationNo: 'LM-REG-DEL-2024-9912',
      address: 'Plot 48, Okhla Industrial Area Phase II, New Delhi 110020',
      jurisdiction: 'South Delhi',
      expiryAlertDays: 30,
    },
    create: {
      id: 'ORG-APEX-LOGISTICS',
      name: 'Apex Logistics & Freight Hub',
      email: 'business@company.com',
      phone: '+91 99100 11223',
      gstin: '07AAACM4821K1Z5',
      lmRegistrationNo: 'LM-REG-DEL-2024-9912',
      address: 'Plot 48, Okhla Industrial Area Phase II, New Delhi 110020',
      jurisdiction: 'South Delhi',
      expiryAlertDays: 30,
    },
  })

  // 2. Users for all 4 roles
  const users = [
    {
      email: 'admin@gov.in',
      name: 'State Administrator',
      role: UserRole.STATE_ADMINISTRATOR,
      organisationId: null,
    },
    {
      email: 'lmo@gov.in',
      name: 'Legal Metrology Officer',
      role: UserRole.LEGAL_METROLOGY_OFFICER,
      organisationId: null,
    },
    {
      email: 'gatc@gov.in',
      name: 'GATC Operator',
      role: UserRole.GATC_OPERATOR,
      organisationId: null,
    },
    {
      email: 'business@company.com',
      name: 'Apex Logistics & Freight Hub',
      role: UserRole.APPLICANT_BUSINESS,
      organisationId: org.id,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash: defaultPassword,
        organisationId: user.organisationId,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: defaultPassword,
        organisationId: user.organisationId,
      },
    })
    console.log(`- Seeded user: ${user.name} (${user.email}) -> Role: ${user.role}`)
  }

  // 3. Seed Instruments for Apex Logistics
  const instruments = [
    {
      platformId: 'WM-DEL-01982',
      type: 'Electronic Heavy Weighbridge',
      manufacturer: 'A&D Scales Ltd',
      model: 'GX-60K',
      serialNumber: 'AD2401982',
      capacity: '60 Metric Tonnes',
      accuracyClass: 'Class III',
      location: 'Gate No 2, Heavy Freight Bay',
      premises: 'Okhla Logistics Centre Phase II',
      status: 'Active',
      lastVerified: '24 Sep 2024',
      nextDue: '24 Sep 2025',
      certificateNo: 'LM-CERT-2024-9982',
      sealNo: 'GOV-DEL-8821',
      ownerId: org.id,
    },
    {
      platformId: 'WM-DEL-01981',
      type: 'Digital Platform Scale',
      manufacturer: 'Essae-Teraoka',
      model: 'PB-600',
      serialNumber: 'ES2401981',
      capacity: '500 kg x 50g',
      accuracyClass: 'Class III',
      location: 'Main Packing Floor A',
      premises: 'Azadpur Cold Storage Facility',
      status: 'Pending Verification',
      lastVerified: '25 Sep 2023',
      nextDue: '25 Sep 2024',
      certificateNo: 'LM-CERT-2023-8812',
      sealNo: 'GOV-DEL-7410',
      ownerId: org.id,
    },
    {
      platformId: 'WM-DEL-01976',
      type: 'Automatic Mass Flow Meter',
      manufacturer: 'Gilbarco Veeder-Root',
      model: 'Encore 700 S',
      serialNumber: 'GB2401976',
      capacity: '120 Litres/min',
      accuracyClass: 'Class 0.5',
      location: 'Fuel Dispensing Bay 1',
      premises: 'Narela Industrial Terminal',
      status: 'Active',
      lastVerified: '18 Sep 2024',
      nextDue: '18 Sep 2025',
      certificateNo: 'LM-CERT-2024-9176',
      sealNo: 'GOV-DEL-6549',
      ownerId: org.id,
    },
    {
      platformId: 'WM-DEL-01974',
      type: 'High Precision Counter Scale',
      manufacturer: 'Mettler Toledo',
      model: 'bPlus-T2',
      serialNumber: 'MT2401974',
      capacity: '15 kg x 2g',
      accuracyClass: 'Class II',
      location: 'Counter 04 - Retail Outlet',
      premises: 'Lajpat Nagar Central Depot',
      status: 'Expired',
      lastVerified: '10 Aug 2023',
      nextDue: '10 Aug 2024',
      certificateNo: 'LM-CERT-2023-6611',
      sealNo: 'GOV-DEL-4412',
      ownerId: org.id,
    },
    {
      platformId: 'WM-DEL-01955',
      type: 'Automatic Tank Gauging System',
      manufacturer: 'Endress+Hauser',
      model: 'Tankvision Pro',
      serialNumber: 'EH2401955',
      capacity: '50,000 Litres',
      accuracyClass: 'Class 0.2',
      location: 'Liquid Storage Terminal 3',
      premises: 'Narela Industrial Terminal',
      status: 'Active',
      lastVerified: '02 Jun 2024',
      nextDue: '02 Jun 2025',
      certificateNo: 'LM-CERT-2024-4419',
      sealNo: 'GOV-DEL-9081',
      ownerId: org.id,
    },
  ]

  for (const inst of instruments) {
    await prisma.instrument.upsert({
      where: { platformId: inst.platformId },
      update: {
        ...inst,
      },
      create: {
        id: inst.platformId,
        ...inst,
      },
    })
  }
  console.log(`- Seeded ${instruments.length} instruments for Apex Logistics`)

  // 4. Seed Applications & Events
  const applications = [
    {
      applicationNo: 'LM-2024-08421',
      type: 'Re-verification',
      instrumentId: 'WM-DEL-01982',
      instrumentName: 'Electronic Heavy Weighbridge',
      location: 'Okhla Logistics Centre Phase II',
      status: 'Under review',
      assignedOfficer: 'L. Mehta (LMO - South Delhi)',
      scheduledDate: '28 Sep 2024',
      feeAmount: 2400,
      feePaid: true,
      applicantId: org.id,
    },
    {
      applicationNo: 'LM-2024-08420',
      type: 'Initial verification',
      instrumentId: 'WM-DEL-01981',
      instrumentName: 'Digital Platform Scale',
      location: 'Azadpur Cold Storage Facility',
      status: 'Scheduled',
      assignedOfficer: 'R. Iyer (LMO - North Delhi)',
      scheduledDate: '26 Sep 2024, 11:30 AM',
      feeAmount: 1200,
      feePaid: true,
      applicantId: org.id,
    },
    {
      applicationNo: 'LM-2024-08419',
      type: 'Re-verification',
      instrumentId: 'WM-DEL-01976',
      instrumentName: 'Automatic Mass Flow Meter',
      location: 'Narela Industrial Terminal',
      status: 'Verified',
      assignedOfficer: 'S. K. Verma (LMO - Narela Zone)',
      scheduledDate: '18 Sep 2024',
      feeAmount: 3500,
      feePaid: true,
      applicantId: org.id,
    },
    {
      applicationNo: 'LM-2024-08418',
      type: 'After repair',
      instrumentId: 'WM-DEL-01974',
      instrumentName: 'High Precision Counter Scale',
      location: 'Lajpat Nagar Central Depot',
      status: 'Action required',
      assignedOfficer: 'P. Sharma (LMO - Central Zone)',
      feeAmount: 850,
      feePaid: false,
      applicantId: org.id,
    },
  ]

  for (const app of applications) {
    const createdApp = await prisma.application.upsert({
      where: { applicationNo: app.applicationNo },
      update: {
        ...app,
      },
      create: {
        id: app.applicationNo,
        ...app,
      },
    })

    // Seed events if not exists
    const eventCount = await prisma.applicationEvent.count({ where: { applicationId: createdApp.id } })
    if (eventCount === 0) {
      await prisma.applicationEvent.createMany({
        data: [
          {
            applicationId: createdApp.id,
            previousStatus: null,
            newStatus: 'Submitted',
            reason: 'Application submitted with payment confirmation by applicant',
          },
          {
            applicationId: createdApp.id,
            previousStatus: 'Submitted',
            newStatus: app.status,
            reason: `Application status updated to ${app.status}`,
          },
        ],
      })
    }
  }
  console.log(`- Seeded ${applications.length} applications with audit history`)

  // 5. Seed Certificates
  const certificates = [
    {
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
      downloadUrl: '/api/business/certificates/LM-CERT-2024-9982/download',
      organisationId: org.id,
    },
    {
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
      downloadUrl: '/api/business/certificates/LM-CERT-2024-9176/download',
      organisationId: org.id,
    },
    {
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
      downloadUrl: '/api/business/certificates/LM-CERT-2023-8812/download',
      organisationId: org.id,
    },
    {
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
      downloadUrl: '/api/business/certificates/LM-CERT-2023-6611/download',
      organisationId: org.id,
    },
  ]

  for (const cert of certificates) {
    await prisma.certificate.upsert({
      where: { certificateNo: cert.certificateNo },
      update: {
        ...cert,
      },
      create: {
        id: cert.certificateNo,
        ...cert,
      },
    })
  }
  console.log(`- Seeded ${certificates.length} digital certificates`)

  // 6. Seed Scheduled Inspections
  const inspections = [
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
      organisationId: org.id,
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
      organisationId: org.id,
    },
  ]

  for (const insp of inspections) {
    await prisma.scheduledInspection.upsert({
      where: { id: insp.id },
      update: { ...insp },
      create: { ...insp },
    })
  }
  console.log(`- Seeded ${inspections.length} scheduled inspections`)

  // 7. Seed Premises
  const premisesList = [
    {
      id: 'PREM-01',
      name: 'Okhla Logistics Centre Phase II',
      address: 'Plot 48, Okhla Industrial Area Phase II, New Delhi 110020',
      district: 'South Delhi',
      managerName: 'Vikram Singh',
      managerPhone: '+91 99100 11223',
      activeInstrumentsCount: 8,
      complianceScore: 100,
      organisationId: org.id,
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
      organisationId: org.id,
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
      organisationId: org.id,
    },
  ]

  for (const p of premisesList) {
    await prisma.premises.upsert({
      where: { id: p.id },
      update: { ...p },
      create: { ...p },
    })
  }
  console.log(`- Seeded ${premisesList.length} operational business premises`)

  // 8. Seed Licensed Repairers
  const repairers = [
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

  for (const r of repairers) {
    await prisma.licensedRepairer.upsert({
      where: { licenseNo: r.licenseNo },
      update: { ...r },
      create: { ...r },
    })
  }
  console.log(`- Seeded ${repairers.length} licensed repairers`)

  // 9. Seed Business Notifications
  const notifications = [
    {
      id: 'NOTIF-01',
      title: 'Verification Renewal Due: High Precision Scale',
      detail: 'Instrument WM-DEL-01974 at Lajpat Nagar is due for renewal within 15 days.',
      unread: true,
      organisationId: org.id,
    },
    {
      id: 'NOTIF-02',
      title: 'Field Inspection Scheduled: Platform Scale',
      detail: 'LMO Officer R. Iyer scheduled to visit Azadpur facility on 26 Sep 2024 at 11:30 AM.',
      unread: true,
      organisationId: org.id,
    },
    {
      id: 'NOTIF-03',
      title: 'Digital Certificate Issued: Weighbridge 60T',
      detail: 'Certificate LM-CERT-2024-9982 generated with secure digital seal.',
      unread: false,
      organisationId: org.id,
    },
  ]

  for (const n of notifications) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: { ...n },
      create: { ...n },
    })
  }
  console.log(`- Seeded ${notifications.length} business notifications`)

  console.log('Seeding complete! Default password for all seed accounts: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
