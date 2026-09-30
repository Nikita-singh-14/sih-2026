import { Router, type Response } from 'express'
import { UserRole } from '@prisma/client'
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware/auth'
import { complaintService, type ComplaintCategory, type ComplaintStatus } from '../services/complaintService'
import { verificationService } from '../services/verificationService'

const router = Router()
const reviewers = [UserRole.STATE_ADMINISTRATOR, UserRole.LEGAL_METROLOGY_OFFICER]
const complaintTeams = [UserRole.STATE_ADMINISTRATOR, UserRole.GATC_OPERATOR]

router.post('/verification/complaints', async (request, response: Response) => {
  const body = request.body as {
    category?: string
    searchedIdentifier?: string
    instrumentId?: string
    certificateNo?: string
    reportedSerialNumber?: string
    reporterName?: string
    reporterEmail?: string
    description?: string
  }
  const category = body.category
  const searchedIdentifier = body.searchedIdentifier?.trim()
  const description = body.description?.trim()

  if (category !== 'CERTIFICATE_ISSUE' && category !== 'SERIAL_MISMATCH') {
    return response.status(400).json({ message: 'Choose a certificate issue or serial number mismatch' })
  }
  if (!searchedIdentifier || searchedIdentifier.length > 160) {
    return response.status(400).json({ message: 'A valid certificate or serial number is required' })
  }
  if (!description || description.length < 10 || description.length > 2000) {
    return response.status(400).json({ message: 'Describe the problem in 10 to 2000 characters' })
  }
  if (category === 'SERIAL_MISMATCH' && !body.reportedSerialNumber?.trim()) {
    return response.status(400).json({ message: 'Enter the serial number printed on the instrument' })
  }
  if (body.reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.reporterEmail.trim())) {
    return response.status(400).json({ message: 'Enter a valid email address' })
  }

  try {
    const complaint = await complaintService.create({
      category: category as ComplaintCategory,
      searchedIdentifier,
      instrumentId: body.instrumentId,
      certificateNo: body.certificateNo,
      reportedSerialNumber: body.reportedSerialNumber,
      reporterName: body.reporterName,
      reporterEmail: body.reporterEmail,
      description,
    })
    return response.status(201).json({ complaint })
  } catch (error) {
    console.error('Failed to create certificate complaint:', error)
    return response.status(500).json({ message: 'Unable to submit the report right now' })
  }
})

router.get('/complaints', authenticate, requireRole(...complaintTeams), async (_request, response: Response) => {
  try {
    return response.json({ complaints: await complaintService.list() })
  } catch (error) {
    console.error('Failed to load certificate complaints:', error)
    return response.status(500).json({ message: 'Unable to load certificate reports' })
  }
})

router.patch('/complaints/:id', authenticate, requireRole(...complaintTeams), async (request: AuthenticatedRequest, response: Response) => {
  const body = request.body as { status?: string; notes?: string }
  const allowedStatuses: ComplaintStatus[] = ['New', 'Under review', 'Escalated', 'Resolved']
  if (!allowedStatuses.includes(body.status as ComplaintStatus)) {
    return response.status(400).json({ message: 'Choose a valid report status' })
  }
  if (body.status === 'Resolved' && !body.notes?.trim()) {
    return response.status(400).json({ message: 'Add a resolution note before resolving this report' })
  }

  try {
    const complaint = await complaintService.update(
      String(request.params.id),
      body.status as ComplaintStatus,
      body.notes || '',
      { id: request.user!.sub, role: request.user!.role }
    )
    if (!complaint) return response.status(404).json({ message: 'Report not found' })
    return response.json({ complaint })
  } catch (error) {
    console.error('Failed to update certificate complaint:', error)
    return response.status(500).json({ message: 'Unable to update this report right now' })
  }
})

router.get('/verification/lookup', async (request, response: Response) => {
  const identifier = typeof request.query.identifier === 'string' ? request.query.identifier : ''
  try {
    return response.json({ results: await verificationService.lookup(identifier) })
  } catch (error) {
    console.error('Public instrument lookup failed:', error)
    return response.status(500).json({ message: 'Unable to verify this instrument right now' })
  }
})

router.use('/review', authenticate, requireRole(...reviewers))

router.get('/review/applications', async (_request, response: Response) => {
  try {
    return response.json(await verificationService.getReviewQueue())
  } catch (error) {
    console.error('Failed to load verification review queue:', error)
    return response.status(500).json({ message: 'Unable to load applications for review' })
  }
})

router.post('/review/applications/:id/decision', async (request: AuthenticatedRequest, response: Response) => {
  const body = request.body as { decision?: string; sealNumber?: string; validityMonths?: number; reason?: string }
  if (body.decision !== 'PASSED' && body.decision !== 'FAILED') {
    return response.status(400).json({ message: 'Decision must be PASSED or FAILED' })
  }

  try {
    const result = await verificationService.decideApplication(
      String(request.params.id),
      { id: request.user!.sub, name: request.user!.name, role: request.user!.role },
      body.decision,
      body
    )
    return response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to review application'
    const status = message === 'Application not found' ? 404 : 400
    return response.status(status).json({ message })
  }
})

export default router