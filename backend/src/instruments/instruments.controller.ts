import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { CreateInstrumentDto } from './dto/create-instrument.dto'
import { InstrumentsService } from './instruments.service'

@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.instrumentsService.findAll(search)
  }

  @Post()
  create(@Body() dto: CreateInstrumentDto) {
    return this.instrumentsService.create(dto)
  }
}
