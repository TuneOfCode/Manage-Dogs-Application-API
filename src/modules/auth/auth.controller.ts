import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import ms from 'ms';
import { storageUser } from 'src/constants';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guard/jwt-auth-guard';
import { LocalAuthGuard } from './guard/local-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() payload) {
    try {
      const { password, ...result } = await this.authService.checkEmail(
        payload.email,
      );

      const response = await this.authService.generateToken(payload);

      return {
        status_code: HttpStatus.CREATED,
        message: 'Login successful',
        data: result,
        meta: {
          access_token: response.accessToken,
          expires_in: ms(ms(process.env.EXPIES_IN), { long: true }),
          refresh_token: response.refreshToken,
          refresh_expires_in: ms(ms(process.env.REFRESH_EXPIES_IN), {
            long: true,
          }),
        },
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar_url', storageUser))
  async register(
    @Body() payload,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    console.log('Payload: ', payload);
    const user = await this.userService.findByEmail(payload.email);
    if (user) {
      throw new ConflictException({
        status_code: HttpStatus.CONFLICT,
        message: `${payload.email} already exists`,
      });
    }
    let newPayload = payload;
    if (file) {
      newPayload = {
        ...payload,
        avatar_url: file.filename,
      };
    }
    console.log('payload: ', newPayload);

    const { password, ...result } = await this.authService.register(newPayload);
    const response = await this.authService.generateToken(newPayload);
    try {
      return {
        status_code: HttpStatus.CREATED,
        message: 'Register successful',
        data: result,
        meta: {
          access_token: response.accessToken,
          expires_in: ms(ms(process.env.EXPIES_IN), { long: true }),
          refresh_token: response.refreshToken,
          refresh_expires_in: ms(ms(process.env.REFRESH_EXPIES_IN), {
            long: true,
          }),
        },
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async profile(@Request() req) {
    if (req?.user) {
      try {
        const { password, ...result } = await this.userService.findByEmail(
          req?.user?.email,
        );

        return {
          status_code: HttpStatus.OK,
          data: result,
          meta: {
            iat: req?.user.iat,
            exp: req?.user.exp,
            published_at: new Date(req?.user.iat * 1000).toLocaleString(
              'es-US',
            ),
            expires_at: new Date(req?.user.exp * 1000).toLocaleString('es-US'),
          },
        };
      } catch (error) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      }
    }
    throw new UnauthorizedException();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/edit')
  async updateProfile(@Body() payload, @Request() req) {
    if (req?.user) {
      const { id } = await this.userService.findByEmail(req?.user?.email);
      await this.userService.update(id, payload);
      try {
        return {
          status_code: HttpStatus.OK,
          message: `Update me (userId #${id}) successful!`,
        };
      } catch (error) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      }
    }
    throw new UnauthorizedException();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/edit/upload-avatar')
  @UseInterceptors(FileInterceptor('avatar_url', storageUser))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Request() req,
  ) {
    if (req?.user) {
      try {
        await this.userService.updateByEmail(req?.user?.email, {
          avatar_url: file.filename,
        });
        return {
          status_code: HttpStatus.CREATED,
          message: `Edit avatar of me (email ${req?.user?.email}) successful`,
          data: {
            email: req?.user?.email,
            avatar_url: file.filename,
          },
        };
      } catch (error) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      }
    }
    throw new UnauthorizedException();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/change-password')
  async ChangePassword(@Body() payload: ChangePasswordDto, @Request() req) {
    if (req?.user) {
      try {
        const userLogin = await this.authService.validateUser(
          req?.user.email,
          payload.old_password,
        );
        console.log('payload: ', payload);
        console.log('userLogin: ', userLogin);

        if (userLogin === 'pwd') {
          return {
            status_code: HttpStatus.BAD_REQUEST,
            message: `Incorrect old password `,
          };
        }
        if (payload.new_password !== payload.confirm_password) {
          return {
            status_code: HttpStatus.BAD_REQUEST,
            message: `Incorrect confirm password`,
          };
        }
        await this.authService.changePassword(req?.user.email, payload);
        return {
          status_code: HttpStatus.CREATED,
          message: `Change password for me (email: ${req?.user.email}) successful`,
        };
      } catch (error) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      }
    }
    throw new UnauthorizedException();
  }
}
