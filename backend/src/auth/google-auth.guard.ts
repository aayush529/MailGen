import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { getFrontendUrl, isGoogleOAuthConfigured } from './auth.constants';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (!isGoogleOAuthConfigured()) {
      const response = context.switchToHttp().getResponse<Response>();
      response.redirect(`${getFrontendUrl()}/login?error=google_not_configured`);
      return false;
    }

    return super.canActivate(context);
  }
}
