import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApplicationStatus, UserRole } from '@prisma/client'
import { ApplicationsService } from './applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { TransitionApplicationDto } from './dto/transition-application.dto'
import { JwtAuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto)
  }

  @Get()
  findAll(@Query('status') status?: ApplicationStatus) {
    return this.applicationsService.findAll(status)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STATE_ADMINISTRATOR, UserRole.LEGAL_METROLOGY_OFFICER, UserRole.GATC_OPERATOR)
  transition(@Param('id') id: string, @Body() dto: TransitionApplicationDto) {
    return this.applicationsService.transition(id, dto)
  }
}
