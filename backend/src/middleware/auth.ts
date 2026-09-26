import { type NextFunction, type Request, type Response } from 'express'
import { verify } from 'jsonwebtoken'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()
const jwtSecret = process.env.JWT_SECRET || 'development-only-secret'

export interface AuthPayload {
  sub: string
  email: string
  name: string
  role: UserRole
  organisationId?: string | null
}

export type AuthenticatedRequest = Request & {
  user?: AuthPayload
  organisationId?: string
}

export function authenticate(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Authorization token required' })
  }

  try {
    const decoded = verify(header.slice(7), jwtSecret) as AuthPayload
    request.user = decoded
    next()
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Unauthorized' })
    }
    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: 'Forbidden: Insufficient privileges for this role' })
    }
    next()
  }
}

/**
 * Ensures the authenticated user is an APPLICANT_BUSINESS and resolves their associated Organisation ID.
 * If the user's organisationId is missing, it creates or links one automatically.
 */
export async function requireBusinessOrganisation(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  if (!request.user) {
    return response.status(401).json({ message: 'Unauthorized' })
  }

  if (request.user.role !== UserRole.APPLICANT_BUSINESS) {
    return response.status(403).json({ message: 'Forbidden: Accessible only to Business Applicants' })
  }

  try {
    let orgId = request.user.organisationId

    if (!orgId) {
      // Look up user in DB to check if organisationId was updated
      const dbUser = await prisma.user.findUnique({
        where: { id: request.user.sub },
        include: { organisation: true },
      })

      if (dbUser?.organisationId) {
        orgId = dbUser.organisationId
      } else {
        // Create an organization for this business applicant
        const newOrg = await prisma.organisation.create({
          data: {
            name: dbUser?.name || 'My Business Enterprise',
            email: dbUser?.email,
            jurisdiction: 'South Delhi',
            expiryAlertDays: 30,
          },
        })
        orgId = newOrg.id

        await prisma.user.update({
          where: { id: request.user.sub },
          data: { organisationId: newOrg.id },
        })
      }
    }

    request.organisationId = orgId
    next()
  } catch (err) {
    console.error('Error resolving business organisation:', err)
    return response.status(500).json({ message: 'Failed to resolve business account organisation' })
  }
}
