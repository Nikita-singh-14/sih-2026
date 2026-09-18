import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import type { Request } from 'express'
import type { AuthPayload } from './auth.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [context.getHandler(), context.getClass()])
    if (!requiredRoles?.length) return true
    const request = context.switchToHttp().getRequest<Request & { user?: AuthPayload }>()
    if (!request.user || !requiredRoles.includes(request.user.role)) throw new ForbiddenException('Your role cannot perform this action')
    return true
  }
}
