import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { Observable, of } from 'rxjs';
import { Role } from 'src/constants';
import { storageUser } from 'src/constants/';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth-guard';
import { RoleGuard } from '../auth/guard/role-guard';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@UseGuards(RoleGuard)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Get()
  async getAll() {
    try {
      return {
        status_code: HttpStatus.OK,
        data: await this.usersService.findAll(),
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  async getId(@Param('id') id: number) {
    try {
      const { password, ...result } = await this.usersService.findById(id);
      return {
        status_code: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN, Role.USER)
  @Patch(':id/edit')
  async update(@Param('id') id: number, @Body() payload: UserDto) {
    try {
      if (payload.password)
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'not API',
        };
      await this.usersService.update(id, payload);
      return {
        status_code: HttpStatus.OK,
        message: `Update userId #${id} successful!`,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN)
  @Patch('upload/edit/avatars')
  @UseInterceptors(FileInterceptor('avatar_url', storageUser))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Request() req,
  ) {
    if (req?.user) {
      try {
        await this.usersService.updateByEmail(req?.user?.email, {
          avatar_url: file.filename,
        });
        return {
          status_code: HttpStatus.CREATED,
          message: `Edit avatar of email ${req?.user?.email} successful`,
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

  @Roles(Role.ADMIN, Role.USER)
  @Get('upload/avatars/:avatar_url')
  GetAAavatar(@Param('avatar_url') avatar_url, @Res() res): Observable<Object> {
    return of(
      res.sendFile(join(process.cwd(), `uploads/avatars/${avatar_url}`)),
    );
  }

  @Roles(Role.ADMIN)
  @Delete(':id/destroy')
  async destroy(@Param('id') id: number) {
    try {
      await this.usersService.destroy(id);
      return {
        status_code: HttpStatus.OK,
        message: `delete userId #${id} successful`,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }
}
