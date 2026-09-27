import 'dotenv/config'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { compare, hash } from 'bcryptjs'
import { PrismaClient, UserRole } from '@prisma/client'
import { sign, verify } from 'jsonwebtoken'
import businessRouter from './routes/business'

const app = express()
const prisma = new PrismaClient()
const port = Number(process.env.PORT || 3000)
const jwtSecret = process.env.JWT_SECRET || 'development-only-secret'

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

interface AuthPayload {
  sub: string
  email: string
  name: string
  role: UserRole
  organisationId?: string | null
}

type AuthenticatedRequest = Request & { user?: AuthPayload }

function issueToken(user: { id: string; name: string; email: string; role: UserRole; organisationId?: string | null }) {
  const payload: AuthPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organisationId: user.organisationId,
  }
  return {
    accessToken: sign(payload, jwtSecret, { expiresIn: '8h' }),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organisationId: user.organisationId,
    },
  }
}

function authenticate(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) return response.status(401).json({ message: 'Unauthorized' })
  try {
    request.user = verify(header.slice(7), jwtSecret) as AuthPayload
    next()
  } catch {
    return response.status(401).json({ message: 'Unauthorized' })
  }
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'measuresure-express' }))

// Mount business routes for Applicant / Business role
app.use('/api/business', businessRouter)

app.post('/api/auth/signup', async (request, response) => {
  const { name, email, password, role } = request.body as { name?: string; email?: string; password?: string; role?: UserRole }
  const normalizedEmail = email?.trim().toLowerCase()
  if (!name?.trim() || !normalizedEmail || !password || password.length < 6) {
    return response.status(400).json({ message: 'Name, email, and a password of at least 6 characters are required' })
  }
  if (role && !Object.values(UserRole).includes(role)) {
    return response.status(400).json({ message: 'Invalid role' })
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) return response.status(409).json({ message: 'An account with this email already exists' })

  const userRole = role || UserRole.APPLICANT_BUSINESS
  let organisationId: string | null = null

  if (userRole === UserRole.APPLICANT_BUSINESS) {
    // Automatically provision an organization for this business user
    const org = await prisma.organisation.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        jurisdiction: 'South Delhi',
        expiryAlertDays: 30,
      },
    })
    organisationId = org.id
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hash(password, 12),
      role: userRole,
      organisationId,
    },
  })

  return response.status(201).json(issueToken(user))
})

app.post('/api/auth/login', async (request, response) => {
  const { email, password } = request.body as { email?: string; password?: string }
  const normalizedEmail = email?.trim().toLowerCase()
  const user = normalizedEmail
    ? await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { organisation: true },
      })
    : null

  if (!user || !password || !(await compare(password, user.passwordHash))) {
    return response.status(401).json({ message: 'Invalid email or password' })
  }

  // If business user doesn't have an organization, provision one now
  if (user.role === UserRole.APPLICANT_BUSINESS && !user.organisationId) {
    const org = await prisma.organisation.create({
      data: {
        name: user.name,
        email: user.email,
        jurisdiction: 'South Delhi',
        expiryAlertDays: 30,
      },
    })
    user.organisationId = org.id
    await prisma.user.update({
      where: { id: user.id },
      data: { organisationId: org.id },
    })
  }

  return response.json(issueToken(user))
})

app.get('/api/auth/me', authenticate, async (request: AuthenticatedRequest, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.user!.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organisationId: true,
      organisation: true,
    },
  })
  if (!user) return response.status(404).json({ message: 'User not found' })
  return response.json(user)
})

app.get('/api/instruments', async (request, response) => {
  const search = typeof request.query.search === 'string' ? request.query.search : undefined
  const instruments = await prisma.instrument.findMany({
    where: search
      ? {
          OR: [
            { platformId: { contains: search } },
            { serialNumber: { contains: search } },
            { type: { contains: search } },
            { location: { contains: search } },
          ],
        }
      : undefined,
    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  })
  return response.json(instruments)
})

app.post('/api/instruments', authenticate, async (request, response) => {
  const body = request.body as {
    platformId?: string
    type?: string
    manufacturer?: string
    model?: string
    serialNumber?: string
    capacity?: string
    location?: string
    ownerId?: string
    nextDueDate?: string
  }
  if (!body.platformId || !body.type || !body.manufacturer || !body.model || !body.serialNumber || !body.location || !body.ownerId) {
    return response.status(400).json({ message: 'Required instrument fields are missing' })
  }
  const instrument = await prisma.instrument.create({
    data: {
      platformId: body.platformId,
      type: body.type,
      manufacturer: body.manufacturer,
      model: body.model,
      serialNumber: body.serialNumber,
      capacity: body.capacity,
      location: body.location,
      ownerId: body.ownerId,
      nextDue: body.nextDueDate || 'Immediate verification required',
    },
    include: { owner: true },
  })
  return response.status(201).json(instrument)
})

app.get('/api/applications', authenticate, async (request, response) => {
  const status = typeof request.query.status === 'string' ? request.query.status : undefined
  const applications = await prisma.application.findMany({
    where: status ? { status } : undefined,
    include: { instrument: true, applicant: true },
    orderBy: { createdAt: 'desc' },
  })
  return response.json(applications)
})

app.post('/api/applications', authenticate, async (request, response) => {
  const body = request.body as { type?: string; instrumentId?: string; applicantId?: string }
  if (!body.type || !body.instrumentId || !body.applicantId) {
    return response.status(400).json({ message: 'type, instrumentId, and applicantId are required' })
  }
  const application = await prisma.application.create({
    data: {
      type: body.type,
      instrumentId: body.instrumentId,
      applicantId: body.applicantId,
      applicationNo: `LM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      events: { create: { newStatus: 'Draft' } },
    },
    include: { instrument: true, applicant: true, events: true },
  })
  return response.status(201).json(application)
})

const allowedTransitions: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'Under review', 'CANCELLED'],
  UNDER_REVIEW: ['AWAITING_DOCUMENTS', 'PAYMENT_PENDING', 'REJECTED'],
  'Under review': ['Scheduled', 'Verified', 'Action required', 'REJECTED'],
  AWAITING_DOCUMENTS: ['UNDER_REVIEW', 'CANCELLED'],
  PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['SCHEDULED'],
  SCHEDULED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['INSPECTION_IN_PROGRESS', 'CANCELLED'],
  INSPECTION_IN_PROGRESS: ['PASSED', 'FAILED'],
  PASSED: ['CERTIFICATE_GENERATED'],
  FAILED: ['AWAITING_DOCUMENTS', 'REJECTED', 'APPEAL_SUBMITTED'],
  CERTIFICATE_GENERATED: ['CERTIFICATE_ISSUED'],
  CERTIFICATE_ISSUED: ['EXPIRED', 'SUSPENDED'],
  EXPIRED: ['SUBMITTED'],
  SUSPENDED: ['CERTIFICATE_ISSUED', 'REJECTED'],
  CANCELLED: [],
  REJECTED: ['APPEAL_SUBMITTED'],
  APPEAL_SUBMITTED: ['UNDER_REVIEW'],
}

app.patch('/api/applications/:id/status', authenticate, async (request: AuthenticatedRequest, response) => {
  const allowedRoles: UserRole[] = [UserRole.STATE_ADMINISTRATOR, UserRole.LEGAL_METROLOGY_OFFICER, UserRole.GATC_OPERATOR]
  if (!allowedRoles.includes(request.user!.role)) return response.status(403).json({ message: 'Forbidden' })
  const { status, reason, actorId } = request.body as { status?: string; reason?: string; actorId?: string }
  if (!status) return response.status(400).json({ message: 'A valid status is required' })
  const application = await prisma.application.findUnique({ where: { id: String(request.params.id) } })
  if (!application) return response.status(404).json({ message: 'Application not found' })
  if (allowedTransitions[application.status] && !allowedTransitions[application.status].includes(status)) {
    return response.status(400).json({ message: `Cannot move application from ${application.status} to ${status}` })
  }
  
  const updated = await prisma.$transaction(async (transaction) => {
    const result = await transaction.application.update({
      where: { id: application.id },
      data: {
        status,
        submittedAt: status === 'SUBMITTED' || status === 'Submitted' ? new Date() : undefined,
      },
    })
    await transaction.applicationEvent.create({
      data: {
        applicationId: application.id,
        previousStatus: application.status,
        newStatus: status,
        reason,
        actorId,
      },
    })
    return result
  })
  return response.json(updated)
})

app.use((_request, response) => response.status(404).json({ message: 'Route not found' }))
app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error)
  return response.status(500).json({ message: 'Internal server error' })
})

const server = app.listen(port, () => console.log(`Express API listening on http://localhost:${port}`))

async function shutdown() {
  await prisma.$disconnect()
  server.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
