import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email address already exists');
    }

    // Hash the password (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.signToken(user),
    };
  }

  signToken(user: { id: string; email: string; name: string }): string {
    const payload = { sub: user.id, email: user.email, name: user.name };
    return this.jwtService.sign(payload);
  }

  async validateOAuthUser(profile: { name: string; email: string }) {
    let user = await this.usersService.findOneByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        name: profile.name,
        email: profile.email,
        password: 'oauth-account-no-password',
      });
    }

    return { id: user.id, email: user.email, name: user.name };
  }

  async googleMockLogin(payload: { name: string; email: string; sub: string }) {
    const user = await this.validateOAuthUser({
      name: payload.name,
      email: payload.email,
    });

    return {
      access_token: this.signToken(user),
    };
  }
}
