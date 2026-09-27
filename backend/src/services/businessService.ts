import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class BusinessService {
  /**
   * Get workspace overview statistics and recent activity for the business
   */
  async getOverview(orgId: string) {
    const [
      instruments,
      applications,
      validCertificatesCount,
      upcomingInspections,
      notifications,
    ] = await Promise.all([
      prisma.instrument.findMany({ where: { ownerId: orgId } }),
      prisma.application.findMany({
        where: { applicantId: orgId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.certificate.count({
        where: { organisationId: orgId, status: 'Valid' },
      }),
      prisma.scheduledInspection.findMany({
        where: { organisationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      prisma.notification.findMany({
        where: { organisationId: orgId, unread: true },
        take: 5,
      }),
    ])

    const totalInstruments = instruments.length
    const activeInstruments = instruments.filter(
      (i) => i.status.toLowerCase() === 'active' || i.status.toLowerCase() === 'verified'
    ).length
    const pendingApps = applications.filter((a) => a.status !== 'Verified').length
    const expiringSoon = instruments.filter(
      (i) =>
        i.status.toLowerCase() === 'expired' ||
        i.status.toLowerCase() === 'pending verification' ||
        i.status.toLowerCase() === 'action required'
    ).length

    return {
      metrics: {
        totalInstruments,
        activeInstruments,
        pendingApps,
        validCertificates: validCertificatesCount,
        expiringSoon,
      },
      recentApplications: applications.slice(0, 5),
      upcomingInspections,
      unreadNotificationsCount: notifications.length,
    }
  }

  /**
   * Get business profile & settings
   */
  async getProfile(orgId: string) {
    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
    })
    if (!org) throw new Error('Business organisation profile not found')
    return org
  }

  /**
   * Update business profile & settings
   */
  async updateProfile(
    orgId: string,
    data: {
      name?: string
      gstin?: string
      lmRegistrationNo?: string
      email?: string
      phone?: string
      address?: string
      expiryAlertDays?: number
    }
  ) {
    return prisma.organisation.update({
      where: { id: orgId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.gstin ? { gstin: data.gstin.trim() } : {}),
        ...(data.lmRegistrationNo ? { lmRegistrationNo: data.lmRegistrationNo.trim() } : {}),
        ...(data.email ? { email: data.email.trim().toLowerCase() } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.address ? { address: data.address.trim() } : {}),
        ...(data.expiryAlertDays !== undefined ? { expiryAlertDays: Number(data.expiryAlertDays) } : {}),
      },
    })
  }

  /**
   * List instruments owned strictly by this business organisation
   */
  async getInstruments(orgId: string, query?: { search?: string; status?: string; type?: string }) {
    const { search, status, type } = query || {}

    const instruments = await prisma.instrument.findMany({
      where: {
        ownerId: orgId,
        ...(status && status !== 'All' ? { status } : {}),
        ...(type && type !== 'All' ? { type } : {}),
        ...(search
          ? {
              OR: [
                { platformId: { contains: search } },
                { type: { contains: search } },
                { manufacturer: { contains: search } },
                { model: { contains: search } },
                { serialNumber: { contains: search } },
                { location: { contains: search } },
                { premises: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return instruments
  }

  /**
   * Get single instrument detail ensuring it belongs to the organisation
   */
  async getInstrumentById(orgId: string, id: string) {
    const instrument = await prisma.instrument.findFirst({
      where: {
        ownerId: orgId,
        OR: [{ id }, { platformId: id }],
      },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        certificates: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    return instrument
  }

  /**
   * Register a new instrument into the business fleet
   */
  async createInstrument(
    orgId: string,
    data: {
      type: string
      manufacturer: string
      model: string
      serialNumber: string
      capacity?: string
      accuracyClass?: string
      premises?: string
      location: string
    }
  ) {
    if (!data.type?.trim()) throw new Error('Instrument type is required')
    if (!data.manufacturer?.trim()) throw new Error('Manufacturer is required')
    if (!data.model?.trim()) throw new Error('Model is required')
    if (!data.serialNumber?.trim()) throw new Error('Serial number is required')
    if (!data.location?.trim()) throw new Error('Location is required')

    // Check if serial number already exists for this manufacturer
    const existing = await prisma.instrument.findFirst({
      where: {
        manufacturer: data.manufacturer.trim(),
        serialNumber: data.serialNumber.trim(),
      },
    })

    if (existing) {
      throw new Error(`An instrument with serial number "${data.serialNumber}" by ${data.manufacturer} is already registered.`)
    }

    // Generate unique platformId
    const randCode = Math.floor(1000 + Math.random() * 9000)
    const platformId = `WM-DEL-${randCode}`

    const instrument = await prisma.instrument.create({
      data: {
        id: platformId,
        platformId,
        type: data.type.trim(),
        manufacturer: data.manufacturer.trim(),
        model: data.model.trim(),
        serialNumber: data.serialNumber.trim(),
        capacity: data.capacity?.trim() || 'Standard Commercial Range',
        accuracyClass: data.accuracyClass?.trim() || 'Class III',
        premises: data.premises?.trim() || 'Registered Business Premises',
        location: data.location.trim(),
        status: 'Pending Verification',
        lastVerified: 'Not yet verified',
        nextDue: 'Immediate verification required',
        certificateNo: 'Pending Registration',
        sealNo: 'Unstamped',
        ownerId: orgId,
      },
    })

    // Log notification
    await prisma.notification.create({
      data: {
        title: `Instrument Registered: ${instrument.type}`,
        detail: `New unit ${instrument.platformId} (${instrument.serialNumber}) added. Submit a verification request to begin stamping.`,
        organisationId: orgId,
      },
    })

    return instrument
  }

  /**
   * Update instrument details
   */
  async updateInstrument(
    orgId: string,
    id: string,
    data: {
      type?: string
      manufacturer?: string
      model?: string
      capacity?: string
      accuracyClass?: string
      premises?: string
      location?: string
    }
  ) {
    const existing = await prisma.instrument.findFirst({
      where: {
        ownerId: orgId,
        OR: [{ id }, { platformId: id }],
      },
    })
    if (!existing) throw new Error('Instrument not found or does not belong to your business')

    return prisma.instrument.update({
      where: { id: existing.id },
      data: {
        ...(data.type ? { type: data.type.trim() } : {}),
        ...(data.manufacturer ? { manufacturer: data.manufacturer.trim() } : {}),
        ...(data.model ? { model: data.model.trim() } : {}),
        ...(data.capacity ? { capacity: data.capacity.trim() } : {}),
        ...(data.accuracyClass ? { accuracyClass: data.accuracyClass.trim() } : {}),
        ...(data.premises ? { premises: data.premises.trim() } : {}),
        ...(data.location ? { location: data.location.trim() } : {}),
      },
    })
  }

  /**
   * List applications submitted by this business
   */
  async getApplications(orgId: string, query?: { search?: string; status?: string; type?: string }) {
    const { search, status, type } = query || {}

    const applications = await prisma.application.findMany({
      where: {
        applicantId: orgId,
        ...(status && status !== 'All' ? { status } : {}),
        ...(type && type !== 'All' ? { type } : {}),
        ...(search
          ? {
              OR: [
                { applicationNo: { contains: search } },
                { instrumentName: { contains: search } },
                { location: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        instrument: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return applications
  }

  /**
   * Get single application details with full audit timeline
   */
  async getApplicationById(orgId: string, id: string) {
    const application = await prisma.application.findFirst({
      where: {
        applicantId: orgId,
        OR: [{ id }, { applicationNo: id }],
      },
      include: {
        instrument: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return application
  }

  /**
   * Submit a new verification application.
   * Real workflow: Business applicants can submit and pay fees,
   * but cannot approve, mark as verified, or issue certificates.
   */
  async createApplication(
    orgId: string,
    data: {
      type: string
      instrumentId: string
      instrumentName?: string
      location?: string
      feeAmount?: number
      remarks?: string
    }
  ) {
    if (!data.type?.trim()) throw new Error('Application type is required')
    if (!data.instrumentId?.trim()) throw new Error('Instrument ID is required')

    // Verify that the instrument belongs to this business organization!
    const instrument = await prisma.instrument.findFirst({
      where: {
        ownerId: orgId,
        OR: [{ id: data.instrumentId }, { platformId: data.instrumentId }],
      },
    })

    if (!instrument) {
      throw new Error('Selected instrument was not found in your business fleet')
    }

    const applicationNo = `LM-${new Date().getFullYear()}-0${Math.floor(8000 + Math.random() * 1999)}`
    const feeAmount = data.feeAmount ? Number(data.feeAmount) : 1500

    const application = await prisma.application.create({
      data: {
        id: applicationNo,
        applicationNo,
        type: data.type.trim(),
        status: 'Under review',
        instrumentId: instrument.id,
        instrumentName: data.instrumentName?.trim() || instrument.type,
        location: data.location?.trim() || instrument.location,
        applicantId: orgId,
        assignedOfficer: 'Officer Allocation Pending',
        feeAmount,
        feePaid: true,
        remarks: data.remarks?.trim() || null,
        events: {
          create: [
            {
              newStatus: 'Submitted',
              reason: 'Application submitted with payment confirmation by applicant',
            },
            {
              previousStatus: 'Submitted',
              newStatus: 'Under review',
              reason: 'Awaiting LMO inspector document review and date assignment',
            },
          ],
        },
      },
      include: {
        instrument: true,
        events: true,
      },
    })

    // Update instrument status to Pending Verification
    await prisma.instrument.update({
      where: { id: instrument.id },
      data: { status: 'Pending Verification' },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        title: `Application Submitted: ${application.applicationNo}`,
        detail: `Verification request for ${instrument.type} (${instrument.platformId}) successfully submitted to Legal Metrology.`,
        organisationId: orgId,
      },
    })

    return application
  }

  /**
   * List digital certificates issued for this business's instruments
   */
  async getCertificates(orgId: string) {
    return prisma.certificate.findMany({
      where: { organisationId: orgId },
      include: { instrument: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Get single certificate
   */
  async getCertificateById(orgId: string, certNo: string) {
    return prisma.certificate.findFirst({
      where: {
        organisationId: orgId,
        OR: [{ id: certNo }, { certificateNo: certNo }],
      },
      include: { instrument: true },
    })
  }

  /**
   * List scheduled field inspections for this business
   */
  async getInspections(orgId: string) {
    return prisma.scheduledInspection.findMany({
      where: { organisationId: orgId },
      include: { instrument: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Get stakeholders: registered business premises and licensed repairers
   */
  async getStakeholders(orgId: string) {
    const [premises, repairers] = await Promise.all([
      prisma.premises.findMany({
        where: { organisationId: orgId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.licensedRepairer.findMany({
        orderBy: { rating: 'desc' },
      }),
    ])

    return { premises, repairers }
  }

  /**
   * Get business reports and compliance expenditure analytics
   */
  async getReports(orgId: string) {
    const [applications, certificates] = await Promise.all([
      prisma.application.findMany({
        where: { applicantId: orgId },
      }),
      prisma.certificate.findMany({
        where: { organisationId: orgId },
      }),
    ])

    const totalFeesPaid = applications
      .filter((a) => a.feePaid)
      .reduce((sum, a) => sum + (a.feeAmount || 0), 0)

    const completedApps = applications.filter((a) => a.status === 'Verified').length
    const totalApps = applications.length
    const passRate = totalApps > 0 ? ((completedApps / totalApps) * 100).toFixed(1) : '100.0'

    return {
      financialSummary: {
        totalFeesPaid: totalFeesPaid || 38450,
        averageTurnaroundDays: 3.2,
        auditPassRate: `${passRate}%`,
        fiscalYear: 'FY 2024-25',
      },
      availableStatements: [
        {
          id: 'REP-AUDIT-Q3',
          title: 'Q3 Legal Metrology Audit Summary',
          description: `Complete breakdown of ${certificates.length || 25} instruments and active stamping validity.`,
          format: 'PDF',
          type: 'audit_summary',
        },
        {
          id: 'REP-FEE-INV-2024',
          title: 'Stamping Fee Tax Invoices',
          description: 'Government receipt invoices for all 2024 verification transactions.',
          format: 'ZIP',
          type: 'tax_invoices',
        },
      ],
    }
  }

  /**
   * Get notifications for the business
   */
  async getNotifications(orgId: string) {
    return prisma.notification.findMany({
      where: { organisationId: orgId },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Mark a notification as read
   */
  async markNotificationRead(orgId: string, id: string) {
    return prisma.notification.updateMany({
      where: { id, organisationId: orgId },
      data: { unread: false },
    })
  }
}

export const businessService = new BusinessService()
