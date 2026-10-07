import { Prisma, PrismaClient, UserRole } from '@prisma/client'
import { Router, type Response } from 'express'
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate, requireRole(UserRole.LEGAL_METROLOGY_OFFICER))

router.post('/inspections/submit', async (request: AuthenticatedRequest, response: Response) => {
  const body = request.body as {
    applicationId?: unknown
    decision?: unknown
    officerObservations?: unknown
    gpsCapture?: {
      lat?: unknown
      lng?: unknown
      accuracyMeters?: unknown
      timestamp?: unknown
    }
    visitSelfie?: {
      imageData?: unknown
      capturedAt?: unknown
    }
    photos?: unknown
    testChecklist?: unknown
    readings?: unknown
    officerSignature?: unknown
  }

  const gps = body.gpsCapture
  const selfie = body.visitSelfie
  const validDecision = ['PASSED', 'FAILED', 'FLAGGED'].includes(String(body.decision))
  const validGps =
    typeof gps?.lat === 'number' &&
    Number.isFinite(gps.lat) &&
    gps.lat >= -90 &&
    gps.lat <= 90 &&
    typeof gps.lng === 'number' &&
    Number.isFinite(gps.lng) &&
    gps.lng >= -180 &&
    gps.lng <= 180 &&
    typeof gps.accuracyMeters === 'number' &&
    Number.isFinite(gps.accuracyMeters) &&
    gps.accuracyMeters > 0 &&
    typeof gps.timestamp === 'string' &&
    !Number.isNaN(Date.parse(gps.timestamp))
  const validSelfie =
    typeof selfie?.imageData === 'string' &&
    /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(selfie.imageData) &&
    selfie.imageData.length <= 1_000_000 &&
    typeof selfie.capturedAt === 'string' &&
    !Number.isNaN(Date.parse(selfie.capturedAt))

  if (
    typeof body.applicationId !== 'string' ||
    !body.applicationId.trim() ||
    !validDecision ||
    !validGps ||
    !validSelfie
  ) {
    return response.status(400).json({ message: 'Application, decision, live GPS capture, and a valid selfie are required' })
  }

  const selfieImage = Buffer.from((selfie!.imageData as string).slice('data:image/jpeg;base64,'.length), 'base64')

  try {
    const application = await prisma.application.findUnique({ where: { applicationNo: body.applicationId } })
    if (!application) return response.status(404).json({ message: 'Inspection application not found' })
    if (
      application.assignedOfficer &&
      application.assignedOfficer !== 'Officer Allocation Pending' &&
      ![request.user!.sub, request.user!.email, request.user!.name].includes(application.assignedOfficer)
    ) {
      return response.status(403).json({ message: 'This inspection is assigned to another officer' })
    }

    const existingReport = await prisma.inspectionReport.findUnique({ where: { applicationId: application.id } })
    if (existingReport && existingReport.officerId !== request.user!.sub) {
      return response.status(403).json({ message: 'This inspection report was submitted by another officer' })
    }

    const evidence = {
      photos: body.photos ?? {},
      testChecklist: body.testChecklist ?? [],
      readings: body.readings ?? [],
      officerSignature: typeof body.officerSignature === 'string' ? body.officerSignature : null,
    } as Prisma.InputJsonValue

    const report = await prisma.inspectionReport.upsert({
      where: { applicationId: application.id },
      create: {
        applicationId: application.id,
        officerId: request.user!.sub,
        decision: body.decision as string,
        officerObservations: typeof body.officerObservations === 'string' ? body.officerObservations : '',
        latitude: gps!.lat as number,
        longitude: gps!.lng as number,
        accuracyMeters: gps!.accuracyMeters as number,
        locationCapturedAt: new Date(gps!.timestamp as string),
        selfieImage,
        selfieCapturedAt: new Date(selfie!.capturedAt as string),
        evidence,
      },
      update: {
        officerId: request.user!.sub,
        decision: body.decision as string,
        officerObservations: typeof body.officerObservations === 'string' ? body.officerObservations : '',
        latitude: gps!.lat as number,
        longitude: gps!.lng as number,
        accuracyMeters: gps!.accuracyMeters as number,
        locationCapturedAt: new Date(gps!.timestamp as string),
        selfieImage,
        selfieCapturedAt: new Date(selfie!.capturedAt as string),
        evidence,
      },
    })

    return response.status(201).json({
      id: report.id,
      applicationId: body.applicationId,
      decision: report.decision,
      submittedAt: report.submittedAt,
    })
  } catch (error) {
    console.error('Error submitting LMO inspection report:', error)
    return response.status(500).json({ message: 'Failed to save inspection report' })
  }
})

export default router
