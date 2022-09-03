import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, hashedPassword: string) {
    const user = await this.authService.validateUser(email, hashedPassword);
    if (user === 'email') {
      throw new UnauthorizedException("Email doesn't exist");
    } else if (user === 'pwd') {
      throw new UnauthorizedException('Incorrect password');
    }
    return user;
  }
}
