import { randomUUID } from 'node:crypto'
import { PrismaClient, UserRole } from '@prisma/client'
import QRCode from 'qrcode'

const prisma = new PrismaClient()

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addMonths(date: Date, months: number) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export class VerificationService {
  async getReviewQueue() {
    return prisma.application.findMany({
      where: { status: { notIn: ['Verified', 'Rejected', 'Action required'] } },
      include: {
        instrument: true,
        applicant: { select: { name: true, jurisdiction: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async decideApplication(
    applicationId: string,
    reviewer: { id: string; name: string; role: UserRole },
    decision: 'PASSED' | 'FAILED',
    details: { sealNumber?: string; validityMonths?: number; reason?: string }
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { instrument: true, applicant: true },
    })

    if (!application) throw new Error('Application not found')
    if (['Verified', 'Rejected', 'Action required'].includes(application.status)) {
      throw new Error('This application has already been reviewed')
    }

    const now = new Date()
    const issuedDate = dateOnly(now)
    const validityMonths = Math.min(60, Math.max(1, Number(details.validityMonths) || 12))
    const certificateNo = `LM-CERT-${now.getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`
    const sealNumber = details.sealNumber?.trim() || `LM-SEAL-${randomUUID().slice(0, 8).toUpperCase()}`
    const publicUrl = new URL('/verify', process.env.PUBLIC_APP_URL || 'http://localhost:5173')
    publicUrl.searchParams.set('certificate', certificateNo)

    const qrCodeUrl = decision === 'PASSED'
      ? await QRCode.toDataURL(publicUrl.toString(), { errorCorrectionLevel: 'M', margin: 2, width: 360 })
      : null

    return prisma.$transaction(async (transaction) => {
      const current = await transaction.application.findUnique({ where: { id: application.id } })
      if (!current || ['Verified', 'Rejected', 'Action required'].includes(current.status)) {
        throw new Error('This application has already been reviewed')
      }

      const nextStatus = decision === 'PASSED' ? 'Verified' : 'Action required'
      const reason = details.reason?.trim() || (decision === 'PASSED' ? 'Instrument passed verification' : 'Instrument requires corrective action')

      let certificate = null
      if (decision === 'PASSED') {
        await transaction.certificate.updateMany({
          where: { instrumentId: application.instrumentId, status: 'Valid' },
          data: { status: 'Superseded' },
        })
        certificate = await transaction.certificate.create({
          data: {
            certificateNo,
            instrumentId: application.instrumentId,
            instrumentName: application.instrumentName || application.instrument.type,
            premises: application.location || application.instrument.premises || application.instrument.location,
            issuedDate,
            expiryDate: dateOnly(addMonths(now, validityMonths)),
            status: 'Valid',
            issuedBy: reviewer.name,
            sealNumber,
            qrCodeUrl,
            downloadUrl: `/api/business/certificates/${certificateNo}/download`,
            organisationId: application.applicantId,
          },
        })
        await transaction.instrument.update({
          where: { id: application.instrumentId },
          data: {
            status: 'Active',
            lastVerified: issuedDate,
            nextDue: certificate.expiryDate,
            certificateNo,
            sealNo: sealNumber,
          },
        })
      }

      const updated = await transaction.application.update({
        where: { id: application.id },
        data: { status: nextStatus, assignedOfficer: reviewer.name },
      })

      await transaction.applicationEvent.create({
        data: {
          applicationId: application.id,
          previousStatus: current.status,
          newStatus: nextStatus,
          reason,
          actorId: reviewer.id,
        },
      })

      await transaction.notification.create({
        data: {
          title: decision === 'PASSED' ? `Certificate issued: ${certificateNo}` : `Action required: ${application.applicationNo}`,
          detail: decision === 'PASSED'
            ? `Verification completed for instrument ${application.instrument.platformId}.`
            : reason,
          organisationId: application.applicantId,
        },
      })

      return { application: updated, certificate }
    })
  }

  async lookup(identifier: string) {
    const value = identifier.trim()
    if (!value) return []

    const certificate = await prisma.certificate.findFirst({
      where: { certificateNo: { equals: value, mode: 'insensitive' } },
      include: { instrument: true },
    })

    if (certificate) return [this.toPublicRecord(certificate.instrument, certificate)]

    const instruments = await prisma.instrument.findMany({
      where: {
        OR: [
          { platformId: { equals: value, mode: 'insensitive' } },
          { serialNumber: { equals: value, mode: 'insensitive' } },
        ],
      },
      include: {
        certificates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      take: 20,
    })

    return instruments.map((instrument) => this.toPublicRecord(instrument, instrument.certificates[0] || null))
  }

  private toPublicRecord(instrument: {
    platformId: string
    serialNumber: string
    type: string
    manufacturer: string
    model: string
    capacity: string | null
    location: string
    status: string
    lastVerified: string | null
    nextDue: string | null
    certificateNo: string | null
    sealNo: string | null
  }, certificate: {
    certificateNo: string
    issuedDate: string
    expiryDate: string
    status: string
    issuedBy: string
    sealNumber: string
  } | null) {
    const expired = certificate ? new Date(`${certificate.expiryDate}T23:59:59`) < new Date() : false
    const certificateStatus = !certificate ? 'Not issued' : expired ? 'Expired' : certificate.status

    return {
      instrumentId: instrument.platformId,
      serialNumber: instrument.serialNumber,
      type: instrument.type,
      manufacturer: instrument.manufacturer,
      model: instrument.model,
      capacity: instrument.capacity,
      location: instrument.location,
      instrumentStatus: expired ? 'Expired' : instrument.status,
      lastVerified: instrument.lastVerified,
      nextDue: instrument.nextDue,
      certificate: certificate
        ? {
            certificateNo: certificate.certificateNo,
            issuedDate: certificate.issuedDate,
            expiryDate: certificate.expiryDate,
            status: certificateStatus,
            issuedBy: certificate.issuedBy,
            sealNumber: certificate.sealNumber,
          }
        : null,
      verificationStatus: certificateStatus === 'Valid' ? 'VALID' : certificateStatus.toUpperCase().replaceAll(' ', '_'),
    }
  }
}

export const verificationService = new VerificationService()