import { Injectable } from '@nestjs/common';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: UserDto) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newPayload = { ...payload, password: hashedPassword };
    return this.usersService.create(newPayload);
  }

  async changePassword(email: string, payload: ChangePasswordDto) {
    const hashedPassword = await bcrypt.hash(payload.confirm_password, 10);
    const newPassword = { password: hashedPassword };
    return this.usersService.updateByEmail(email, newPassword);
  }

  async validateUser(email: string, hashedpassword: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) return 'email';
      const isMatchPassword = await bcrypt.compare(
        hashedpassword,
        user.password,
      );
      if (!isMatchPassword) return 'pwd';
      const { password, ...result } = user;
      return result;
    } catch (error) {
      return error.message;
    }
  }

  async checkEmail(email: string) {
    return this.usersService.findByEmail(email);
  }

  verifyAccessToken(accessToken: string) {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      return payload;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.SECRET,
    });

    return payload;
  }

  async updateAccessToken(refreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      const tokens = await this.generateToken(payload);

      return tokens.accessToken;
    } catch (error) {
      return null;
    }
  }

  async generateToken(user: UserDto) {
    const { password, ...payload } = user;

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.SECRET,
      expiresIn: process.env.EXPIES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.SECRET,
      expiresIn: process.env.REFRESH_EXPIES_IN,
    });
    const tokens = { accessToken, refreshToken };

    return tokens;
  }
}
