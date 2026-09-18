import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateInstrumentDto } from './dto/create-instrument.dto'

@Injectable()
export class InstrumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.instrument.findMany({
      where: search
        ? { OR: [{ platformId: { contains: search, mode: 'insensitive' } }, { serialNumber: { contains: search, mode: 'insensitive' } }, { type: { contains: search, mode: 'insensitive' } }, { location: { contains: search, mode: 'insensitive' } }] }
        : undefined,
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  create(dto: CreateInstrumentDto) {
    return this.prisma.instrument.create({
      data: { ...dto, nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : undefined },
      include: { owner: true },
    })
  }
}
