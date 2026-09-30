import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { hash } from 'bcryptjs'
import { PrismaClient, UserRole } from '@prisma/client'

export const prisma = new PrismaClient()
export const apiBase = process.env.TEST_API_URL || 'http://localhost:3000/api'

export async function request(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  return { response, data }
}

export async function createBusiness() {
  const id = randomUUID()
  const email = `e2e-${id}@example.test`
  const signup = await request('/auth/signup', {
    method: 'POST',
    body: { name: `E2E Business ${id.slice(0, 8)}`, email, password: 'test-password-123' },
  })
  assert.equal(signup.response.status, 201, JSON.stringify(signup.data))
  return {
    token: signup.data.accessToken,
    userId: signup.data.user.id,
    organisationId: signup.data.user.organisationId,
    email,
  }
}

export async function createReviewer() {
  const id = randomUUID()
  const password = 'reviewer-test-password'
  const user = await prisma.user.create({
    data: {
      name: 'E2E Legal Metrology Officer',
      email: `reviewer-${id}@example.test`,
      passwordHash: await hash(password, 4),
      role: UserRole.LEGAL_METROLOGY_OFFICER,
    },
  })
  const login = await request('/auth/login', { method: 'POST', body: { email: user.email, password } })
  assert.equal(login.response.status, 200, JSON.stringify(login.data))
  return { id: user.id, token: login.data.accessToken }
}

export async function createGatcOperator() {
  const id = randomUUID()
  const password = 'gatc-test-password'
  const user = await prisma.user.create({
    data: {
      name: 'E2E GATC Operator',
      email: `gatc-${id}@example.test`,
      passwordHash: await hash(password, 4),
      role: UserRole.GATC_OPERATOR,
    },
  })
  const login = await request('/auth/login', { method: 'POST', body: { email: user.email, password } })
  assert.equal(login.response.status, 200, JSON.stringify(login.data))
  return { id: user.id, token: login.data.accessToken }
}

export async function cleanup({ userId, organisationId, reviewerId, instrumentId, applicationId, complaintId } = {}) {
  if (complaintId) {
    await prisma.$executeRaw`DELETE FROM "CertificateComplaintEvent" WHERE "complaintId" = ${complaintId}`
    await prisma.$executeRaw`DELETE FROM "CertificateComplaint" WHERE "id" = ${complaintId}`
  }
  if (applicationId) {
    await prisma.applicationEvent.deleteMany({ where: { applicationId } })
    await prisma.application.deleteMany({ where: { id: applicationId } })
  }
  if (instrumentId) {
    await prisma.certificate.deleteMany({ where: { instrumentId } })
    await prisma.instrument.deleteMany({ where: { id: instrumentId } })
  }
  if (organisationId) {
    await prisma.notification.deleteMany({ where: { organisationId } })
    await prisma.scheduledInspection.deleteMany({ where: { organisationId } })
    await prisma.premises.deleteMany({ where: { organisationId } })
    await prisma.user.updateMany({ where: { organisationId }, data: { organisationId: null } })
    await prisma.organisation.deleteMany({ where: { id: organisationId } })
  }
  if (userId) await prisma.user.deleteMany({ where: { id: userId } })
  if (reviewerId) await prisma.user.deleteMany({ where: { id: reviewerId } })
}

export function assertOk(response, data) {
  assert.equal(response.ok, true, `${response.status}: ${JSON.stringify(data)}`)
}