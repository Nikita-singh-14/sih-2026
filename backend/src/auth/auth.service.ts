import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { LoginDto } from './dto/login.dto'
import { SignupDto } from './dto/signup.dto'
import { UserRole } from '@prisma/client'

export interface AuthPayload {
  sub: string
  email: string
  name: string
  role: UserRole
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async signup(dto: SignupDto) {
    const email = dto.email.trim().toLowerCase()
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new ConflictException('An account with this email already exists')
    const user = await this.prisma.user.create({
      data: { name: dto.name.trim(), email, passwordHash: await hash(dto.password, 12), role: dto.role },
    })
    return this.issueToken(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } })
    if (!user || !(await compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password')
    return this.issueToken(user)
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } })
  }

  private issueToken(user: { id: string; name: string; email: string; role: UserRole }) {
    const payload: AuthPayload = { sub: user.id, name: user.name, email: user.email, role: user.role }
    const accessToken = sign(payload, this.config.get<string>('JWT_SECRET', 'development-only-secret'), { expiresIn: '8h' })
    return { accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }
}
