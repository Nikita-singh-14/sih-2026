import assert from 'node:assert/strict'
import { cleanup, createBusiness, createGatcOperator, prisma, request, assertOk } from './helpers.mjs'

let business
let gatc
let complaintId

try {
  const serialSuffix = Date.now()
  const certificateNo = `LM-CERT-MISMATCH-${serialSuffix}`
  const submitted = await request('/verification/complaints', {
    method: 'POST',
    body: {
      category: 'SERIAL_MISMATCH',
      searchedIdentifier: certificateNo,
      certificateNo,
      reportedSerialNumber: `PHYSICAL-SERIAL-${serialSuffix}`,
      reporterName: 'E2E Reporter',
      reporterEmail: 'reporter@example.test',
      description: 'The serial number printed on the instrument differs from this certificate.',
    },
  })
  assert.equal(submitted.response.status, 201, JSON.stringify(submitted.data))
  complaintId = submitted.data.complaint.id

  const unauthenticated = await request('/complaints')
  assert.equal(unauthenticated.response.status, 401)
  business = await createBusiness()
  const forbidden = await request('/complaints', { token: business.token })
  assert.equal(forbidden.response.status, 403)

  gatc = await createGatcOperator()
  const queue = await request('/complaints', { token: gatc.token })
  assertOk(queue.response, queue.data)
  assert(queue.data.complaints.some((complaint) => complaint.id === complaintId))

  const inReview = await request(`/complaints/${complaintId}`, {
    method: 'PATCH',
    token: gatc.token,
    body: { status: 'Under review', notes: 'Comparing submitted serial details.' },
  })
  assertOk(inReview.response, inReview.data)
  const resolved = await request(`/complaints/${complaintId}`, {
    method: 'PATCH',
    token: gatc.token,
    body: { status: 'Resolved', notes: 'Confirmed mismatch and referred the certificate for correction.' },
  })
  assertOk(resolved.response, resolved.data)
  assert.equal(resolved.data.complaint.status, 'Resolved')

  const persisted = await prisma.$queryRaw`
    SELECT complaint."reportedSerialNumber", complaint."resolution", COUNT(event."id")::int AS "eventCount"
    FROM "CertificateComplaint" AS complaint
    LEFT JOIN "CertificateComplaintEvent" AS event ON event."complaintId" = complaint."id"
    WHERE complaint."id" = ${complaintId}
    GROUP BY complaint."id"
  `
  assert(persisted[0].reportedSerialNumber.startsWith('PHYSICAL-SERIAL-'))
  assert.equal(persisted[0].resolution, 'Confirmed mismatch and referred the certificate for correction.')
  assert.equal(persisted[0].eventCount, 3)
  console.log('PASS complaints: public mismatch report, role-protected GATC triage, resolution, and audit history persisted')
} finally {
  await cleanup({ ...business, reviewerId: gatc?.id, complaintId })
  await prisma.$disconnect()
}