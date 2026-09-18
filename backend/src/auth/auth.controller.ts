import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AuthService, AuthPayload } from './auth.service'
import { JwtAuthGuard } from './auth.guard'
import { LoginDto } from './dto/login.dto'
import { SignupDto } from './dto/signup.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: Request & { user: AuthPayload }) {
    return this.authService.me(request.user.sub)
  }
}
