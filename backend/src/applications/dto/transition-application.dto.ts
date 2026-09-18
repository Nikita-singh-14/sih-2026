import { ApplicationStatus } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class TransitionApplicationDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsString()
  actorId?: string
}
