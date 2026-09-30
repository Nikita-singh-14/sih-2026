import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type ComplaintCategory = 'CERTIFICATE_ISSUE' | 'SERIAL_MISMATCH'
export type ComplaintStatus = 'New' | 'Under review' | 'Escalated' | 'Resolved'

export interface ComplaintInput {
  category: ComplaintCategory
  searchedIdentifier: string
  instrumentId?: string
  certificateNo?: string
  reportedSerialNumber?: string
  reporterName?: string
  reporterEmail?: string
  description: string
}

export interface ComplaintRecord extends ComplaintInput {
  id: string
  category: ComplaintCategory
  status: ComplaintStatus
  resolution: string | null
  createdAt: Date
  updatedAt: Date
}

export class ComplaintService {
  async create(input: ComplaintInput) {
    const id = randomUUID()
    const [complaint] = await prisma.$queryRaw<ComplaintRecord[]>`
      INSERT INTO "CertificateComplaint" (
        "id", "category", "searchedIdentifier", "instrumentId", "certificateNo",
        "reportedSerialNumber", "reporterName", "reporterEmail", "description", "updatedAt"
      ) VALUES (
        ${id}, ${input.category}, ${input.searchedIdentifier.trim()},
        ${input.instrumentId?.trim() || null}, ${input.certificateNo?.trim() || null},
        ${input.reportedSerialNumber?.trim() || null}, ${input.reporterName?.trim() || null},
        ${input.reporterEmail?.trim().toLowerCase() || null}, ${input.description.trim()}, CURRENT_TIMESTAMP
      ) RETURNING "id", "category", "searchedIdentifier", "instrumentId", "certificateNo",
        "reportedSerialNumber", "reporterName", "reporterEmail", "description",
        "status", "resolution", "createdAt", "updatedAt"
    `
    await prisma.$executeRaw`
      INSERT INTO "CertificateComplaintEvent" ("id", "complaintId", "newStatus", "notes")
      VALUES (${randomUUID()}, ${id}, 'New', 'Public report received')
    `
    return complaint
  }

  async list() {
    return prisma.$queryRaw<ComplaintRecord[]>`
      SELECT "id", "category", "searchedIdentifier", "instrumentId", "certificateNo",
        "reportedSerialNumber", "reporterName", "reporterEmail", "description",
        "status", "resolution", "createdAt", "updatedAt"
      FROM "CertificateComplaint"
      ORDER BY CASE "status" WHEN 'New' THEN 0 WHEN 'Under review' THEN 1 ELSE 2 END,
        "createdAt" DESC
      LIMIT 300
    `
  }

  async update(
    id: string,
    status: ComplaintStatus,
    notes: string,
    actor: { id: string; role: string }
  ) {
    return prisma.$transaction(async (transaction) => {
      const [current] = await transaction.$queryRaw<ComplaintRecord[]>`
        SELECT "id", "category", "searchedIdentifier", "instrumentId", "certificateNo",
          "reportedSerialNumber", "reporterName", "reporterEmail", "description",
          "status", "resolution", "createdAt", "updatedAt"
        FROM "CertificateComplaint" WHERE "id" = ${id} FOR UPDATE
      `
      if (!current) return null

      const resolution = status === 'Resolved' ? notes.trim() : current.resolution
      const [updated] = await transaction.$queryRaw<ComplaintRecord[]>`
        UPDATE "CertificateComplaint"
        SET "status" = ${status}, "resolution" = ${resolution}, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${id}
        RETURNING "id", "category", "searchedIdentifier", "instrumentId", "certificateNo",
          "reportedSerialNumber", "reporterName", "reporterEmail", "description",
          "status", "resolution", "createdAt", "updatedAt"
      `
      await transaction.$executeRaw`
        INSERT INTO "CertificateComplaintEvent" (
          "id", "complaintId", "previousStatus", "newStatus", "notes", "actorId", "actorRole"
        ) VALUES (
          ${randomUUID()}, ${id}, ${current.status}, ${status}, ${notes.trim() || null}, ${actor.id}, ${actor.role}
        )
      `
      return updated
    })
  }
}

export const complaintService = new ComplaintService()