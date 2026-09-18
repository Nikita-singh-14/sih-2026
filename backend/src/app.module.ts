import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { HealthController } from './health/health.controller'
import { InstrumentsModule } from './instruments/instruments.module'
import { ApplicationsModule } from './applications/applications.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, InstrumentsModule, ApplicationsModule],
  controllers: [HealthController],
})
export class AppModule {}
