import { Router, type Response } from 'express'
import { UserRole } from '@prisma/client'
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware/auth'
import { verificationService } from '../services/verificationService'

const router = Router()
const reviewers = [UserRole.STATE_ADMINISTRATOR, UserRole.LEGAL_METROLOGY_OFFICER]

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