import { Module } from '@nestjs/common'
import { ApplicationsController } from './applications.controller'
import { ApplicationsService } from './applications.service'
import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({ imports: [PrismaModule, AuthModule], controllers: [ApplicationsController], providers: [ApplicationsService] })
export class ApplicationsModule {}
