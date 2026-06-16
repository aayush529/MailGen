import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { getFrontendUrl } from './auth.constants';

type OAuthUser = { id: string; email: string; name: string };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google-mock')
  @HttpCode(HttpStatus.OK)
  async googleMock(@Body() body: { name: string; email: string; sub: string }) {
    return this.authService.googleMockLogin(body);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Guard redirects to Google's consent screen.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as OAuthUser | undefined;

    if (!user) {
      return res.redirect(`${getFrontendUrl()}/login?error=google_failed`);
    }

    const token = this.authService.signToken(user);
    return res.redirect(`${getFrontendUrl()}/login?token=${token}`);
  }
}
