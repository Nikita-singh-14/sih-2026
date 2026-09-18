import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateInstrumentDto {
  @IsString()
  @IsNotEmpty()
  platformId!: string

  @IsString()
  @IsNotEmpty()
  type!: string

  @IsString()
  @IsNotEmpty()
  manufacturer!: string

  @IsString()
  @IsNotEmpty()
  model!: string

  @IsString()
  @IsNotEmpty()
  serialNumber!: string

  @IsOptional()
  @IsString()
  capacity?: string

  @IsString()
  @IsNotEmpty()
  location!: string

  @IsString()
  @IsNotEmpty()
  ownerId!: string

  @IsOptional()
  @IsDateString()
  nextDueDate?: string
}
