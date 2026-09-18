import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ApplicationType } from '@prisma/client'

export class CreateApplicationDto {
  @IsEnum(ApplicationType)
  type!: ApplicationType

  @IsString()
  @IsNotEmpty()
  instrumentId!: string

  @IsString()
  @IsNotEmpty()
  applicantId!: string
}
