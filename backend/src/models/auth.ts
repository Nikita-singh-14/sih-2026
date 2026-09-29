import type { UserRole } from '@prisma/client'

export interface SignupRequest {
  name?: string
  email?: string
  password?: string
  role?: UserRole
}

export interface LoginRequest {
  email?: string
  password?: string
}

export interface AuthTokenPayload {
  sub: string
  email: string
  name: string
  role: UserRole
  organisationId?: string | null
}

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
  organisationId?: string | null
}
