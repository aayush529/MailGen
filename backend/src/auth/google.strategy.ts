import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { getGoogleOAuthConfig } from './auth.constants';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      ...getGoogleOAuthConfig(),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new Error('Google account did not provide an email address'), undefined);
      return;
    }

    const user = await this.authService.validateOAuthUser({
      email,
      name: profile.displayName || email.split('@')[0],
    });

    done(null, user);
  }
}
