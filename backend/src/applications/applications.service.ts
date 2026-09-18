import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ApplicationStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { TransitionApplicationDto } from './dto/transition-application.dto'

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['AWAITING_DOCUMENTS', 'PAYMENT_PENDING', 'REJECTED'],
  AWAITING_DOCUMENTS: ['UNDER_REVIEW', 'CANCELLED'],
  PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['SCHEDULED'],
  SCHEDULED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['INSPECTION_IN_PROGRESS', 'CANCELLED'],
  INSPECTION_IN_PROGRESS: ['PASSED', 'FAILED'],
  PASSED: ['CERTIFICATE_GENERATED'],
  FAILED: ['AWAITING_DOCUMENTS', 'REJECTED', 'APPEAL_SUBMITTED'],
  CERTIFICATE_GENERATED: ['CERTIFICATE_ISSUED'],
  CERTIFICATE_ISSUED: ['EXPIRED', 'SUSPENDED'],
  EXPIRED: ['SUBMITTED'],
  SUSPENDED: ['CERTIFICATE_ISSUED', 'REJECTED'],
  CANCELLED: [],
  REJECTED: ['APPEAL_SUBMITTED'],
  APPEAL_SUBMITTED: ['UNDER_REVIEW'],
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto) {
    const applicationNo = `LM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    return this.prisma.application.create({
      data: { ...dto, applicationNo, events: { create: { newStatus: 'DRAFT' } } },
      include: { instrument: true, applicant: true, events: true },
    })
  }

  findAll(status?: ApplicationStatus) {
    return this.prisma.application.findMany({
      where: status ? { status } : undefined,
      include: { instrument: true, applicant: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async transition(id: string, dto: TransitionApplicationDto) {
    const application = await this.prisma.application.findUnique({ where: { id } })
    if (!application) throw new NotFoundException('Application not found')
    if (!allowedTransitions[application.status].includes(dto.status)) {
      throw new BadRequestException(`Cannot move application from ${application.status} to ${dto.status}`)
    }

    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.application.update({
        where: { id },
        data: { status: dto.status, submittedAt: dto.status === 'SUBMITTED' ? new Date() : undefined },
      })
      await transaction.applicationEvent.create({
        data: { applicationId: id, previousStatus: application.status, newStatus: dto.status, reason: dto.reason, actorId: dto.actorId },
      })
      return updated
    })
  }
}
