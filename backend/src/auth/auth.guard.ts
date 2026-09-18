import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'jsonwebtoken'
import type { Request } from 'express'
import type { AuthPayload } from './auth.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthPayload }>()
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) throw new UnauthorizedException('Bearer token is required')

    try {
      request.user = verify(token, this.config.get<string>('JWT_SECRET', 'development-only-secret')) as AuthPayload
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
