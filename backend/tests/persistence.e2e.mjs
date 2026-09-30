import assert from 'node:assert/strict'
import { cleanup, createBusiness, prisma, request, assertOk } from './helpers.mjs'

let business
let instrumentId
let applicationId

try {
  business = await createBusiness()
  const serialNumber = `PERSIST-${Date.now()}`
  const createdInstrument = await request('/business/instruments', {
    method: 'POST',
    token: business.token,
    body: {
      type: 'E2E test scale', manufacturer: 'Validation Works', model: 'PW-1',
      serialNumber, capacity: '500 kg', premises: 'Test bay', location: 'Test location',
    },
  })
  assert.equal(createdInstrument.response.status, 201, JSON.stringify(createdInstrument.data))
  instrumentId = createdInstrument.data.id

  const createdApplication = await request('/business/applications', {
    method: 'POST',
    token: business.token,
    body: { type: 'Initial verification', instrumentId, feeAmount: 900 },
  })
  assert.equal(createdApplication.response.status, 201, JSON.stringify(createdApplication.data))
  applicationId = createdApplication.data.id

  const instrumentReadback = await request('/business/instruments', { token: business.token })
  assertOk(instrumentReadback.response, instrumentReadback.data)
  assert(instrumentReadback.data.some((row) => row.serialNumber === serialNumber))

  const applicationReadback = await request('/business/applications', { token: business.token })
  assertOk(applicationReadback.response, applicationReadback.data)
  assert(applicationReadback.data.some((row) => row.id === applicationId))

  const databaseInstrument = await prisma.instrument.findUnique({ where: { id: instrumentId } })
  const databaseApplication = await prisma.application.findUnique({ where: { id: applicationId } })
  assert.equal(databaseInstrument.serialNumber, serialNumber)
  assert.equal(databaseApplication.instrumentId, instrumentId)
  console.log('PASS persistence: instrument and application persisted and read back from API and PostgreSQL')
} finally {
  await cleanup({ ...business, instrumentId, applicationId })
  await prisma.$disconnect()
}