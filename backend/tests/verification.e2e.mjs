import assert from 'node:assert/strict'
import { cleanup, createBusiness, createReviewer, prisma, request, assertOk } from './helpers.mjs'

let business
let reviewer
let instrumentId
let applicationId

try {
  business = await createBusiness()
  const serialNumber = `VERIFY-${Date.now()}`
  const instrumentResult = await request('/business/instruments', {
    method: 'POST',
    token: business.token,
    body: {
      type: 'E2E electronic scale', manufacturer: 'Validation Works', model: 'QR-1',
      serialNumber, capacity: '100 kg', premises: 'Verification test site', location: 'Test bay 1',
    },
  })
  assert.equal(instrumentResult.response.status, 201, JSON.stringify(instrumentResult.data))
  instrumentId = instrumentResult.data.id

  const applicationResult = await request('/business/applications', {
    method: 'POST',
    token: business.token,
    body: { type: 'Initial verification', instrumentId, feeAmount: 1200 },
  })
  assert.equal(applicationResult.response.status, 201, JSON.stringify(applicationResult.data))
  applicationId = applicationResult.data.id

  reviewer = await createReviewer()
  const queue = await request('/review/applications', { token: reviewer.token })
  assertOk(queue.response, queue.data)
  assert(queue.data.some((application) => application.id === applicationId))

  const decision = await request(`/review/applications/${encodeURIComponent(applicationId)}/decision`, {
    method: 'POST',
    token: reviewer.token,
    body: { decision: 'PASSED', sealNumber: 'E2E-SEAL-001', validityMonths: 12 },
  })
  assertOk(decision.response, decision.data)
  assert.equal(decision.data.application.status, 'Verified')
  assert.match(decision.data.certificate.qrCodeUrl, /^data:image\/png;base64,/)
  const certificateNo = decision.data.certificate.certificateNo

  const certificateLookup = await request(`/verification/lookup?identifier=${encodeURIComponent(certificateNo)}`)
  assertOk(certificateLookup.response, certificateLookup.data)
  assert.equal(certificateLookup.data.results[0].verificationStatus, 'VALID')

  const serialLookup = await request(`/verification/lookup?identifier=${encodeURIComponent(serialNumber)}`)
  assertOk(serialLookup.response, serialLookup.data)
  assert.equal(serialLookup.data.results[0].certificate.certificateNo, certificateNo)

  const businessCertificates = await request('/business/certificates', { token: business.token })
  assertOk(businessCertificates.response, businessCertificates.data)
  assert(businessCertificates.data.some((certificate) => certificate.certificateNo === certificateNo))

  const persistedCertificate = await prisma.certificate.findUnique({ where: { certificateNo } })
  const persistedInstrument = await prisma.instrument.findUnique({ where: { id: instrumentId } })
  assert.equal(persistedCertificate.sealNumber, 'E2E-SEAL-001')
  assert.equal(persistedInstrument.status, 'Active')
  assert.equal(persistedInstrument.certificateNo, certificateNo)
  console.log(`PASS verification: application ${applicationResult.data.applicationNo} issued ${certificateNo}; QR and serial lookups valid`)
} finally {
  await cleanup({ ...business, reviewerId: reviewer?.id, instrumentId, applicationId })
  await prisma.$disconnect()
}