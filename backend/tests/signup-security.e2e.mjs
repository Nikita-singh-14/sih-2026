import assert from 'node:assert/strict'
import { cleanup, createBusiness, prisma, request } from './helpers.mjs'

let business

try {
  const privilegedSignup = await request('/auth/signup', {
    method: 'POST',
    body: { name: 'Untrusted Reviewer', email: `untrusted-${Date.now()}@example.test`, password: 'test-password-123', role: 'STATE_ADMINISTRATOR' },
  })
  assert.equal(privilegedSignup.response.status, 403, 'Public signup must not grant privileged roles')

  business = await createBusiness()
  const unauthenticated = await request('/review/applications')
  assert.equal(unauthenticated.response.status, 401, 'Review queue must require authentication')

  const businessCannotReview = await request('/review/applications', { token: business.token })
  assert.equal(businessCannotReview.response.status, 403, 'Business accounts must not access officer review')

  const persistedUser = await prisma.user.findUnique({ where: { id: business.userId } })
  assert.equal(persistedUser.role, 'APPLICANT_BUSINESS')
  console.log('PASS signup security: business signup, privileged signup denied, protected review denied')
} finally {
  await cleanup(business)
  await prisma.$disconnect()
}