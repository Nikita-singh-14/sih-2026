import { PrismaClient, UserRole } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import type { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'

import type { AuthenticatedUser, AuthTokenPayload, LoginRequest, SignupRequest } from '../models/auth'

const prisma = new PrismaClient()
const jwtSecret = process.env.JWT_SECRET || 'development-only-secret'

function issueToken(user: {
  id: string
  name: string
  email: string
  role: UserRole
  organisationId?: string | null
}) {
  const payload: AuthTokenPayload = {
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
    } satisfies AuthenticatedUser,
  }
}

export const authController = {
  signup: async (request: Request, response: Response) => {
    const { name, email, password, role } = request.body as SignupRequest
    const normalizedEmail = email?.trim().toLowerCase()

    if (!name?.trim() || !normalizedEmail || !password || password.length < 6) {
      return response.status(400).json({
        message: 'Name, email, and a password of at least 6 characters are required',
      })
    }

    if (role && !Object.values(UserRole).includes(role)) {
      return response.status(400).json({ message: 'Invalid role' })
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return response.status(409).json({ message: 'An account with this email already exists' })
    }

    const userRole = role || UserRole.APPLICANT_BUSINESS
    let organisationId: string | null = null

    if (userRole === UserRole.APPLICANT_BUSINESS) {
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
  },

  login: async (request: Request, response: Response) => {
    const { email, password } = request.body as LoginRequest
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
  },

  me: async (request: any, response: Response) => {
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

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    return response.json(user)
  },
}
