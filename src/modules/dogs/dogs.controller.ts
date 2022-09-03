import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { Observable, of } from 'rxjs';
import { Role, storageDog } from 'src/constants';
import { DogDto } from 'src/modules/dogs/dto/dog.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth-guard';
import { RoleGuard } from '../auth/guard/role-guard';
import { UsersService } from '../users/users.service';
import { DogsService } from './dogs.service';

@UseGuards(RoleGuard)
@UseGuards(JwtAuthGuard)
@Controller('dogs')
export class DogsController {
  constructor(
    private dogsService: DogsService,
    private usersService: UsersService,
  ) {}

  @Roles(Role.ADMIN)
  @Post('create')
  async create(@Body() createDogDto: DogDto) {
    try {
      console.log('Payload: ', createDogDto);
      const user = await this.usersService.findById(createDogDto.user.id);
      if (!user) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: `${createDogDto.user.id} does not exist`,
        };
      }
      await this.dogsService.create(createDogDto);
      return {
        status_code: HttpStatus.CREATED,
        message: 'create successful',
        data: createDogDto,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN)
  @Patch(':id/edit/upload-image')
  @UseInterceptors(FileInterceptor('image', storageDog))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('id') id: number,
  ) {
    try {
      await this.dogsService.update(id, {
        image: file.filename,
      });
      return {
        status_code: HttpStatus.CREATED,
        message: `Edit image of dogId #${id} successful`,
        data: {
          id: id,
          image: file.filename,
        },
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('upload/images/:image_url')
  GetAImage(@Param('image_url') image_url, @Res() res): Observable<Object> {
    return of(res.sendFile(join(process.cwd(), `uploads/images/${image_url}`)));
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  async findAll() {
    try {
      return {
        statusCode: HttpStatus.OK,
        data: await this.dogsService.findAll(),
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
  async findOne(@Param('id') id: number) {
    try {
      const dog = await this.dogsService.findOne(id);
      if (!dog) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: `Dog #${id} does not exist`,
        };
      }
      return {
        status_code: HttpStatus.OK,
        data: dog,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN)
  @Put(':id/edit')
  async updateAllFields(@Param('id') id: number, @Body() payload: DogDto) {
    try {
      const dog = await this.dogsService.findOne(id);
      if (!dog) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: `User #${id} does not exist`,
        };
      }
      if (payload.user.id) {
        const user = await this.usersService.findById(payload.user.id);
        if (!user) {
          return {
            status_code: HttpStatus.BAD_REQUEST,
            message: `${payload.user.id} does not exist`,
          };
        }
      }
      await this.dogsService.update(id, payload);
      console.log('payload: ', payload);

      return {
        status_code: HttpStatus.OK,
        message: `update dogId #${id} successful`,
        data: payload,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }
  @Roles(Role.ADMIN)
  @Patch(':id/edit')
  async update(@Param('id') id: number, @Body() payload: Partial<DogDto>) {
    try {
      const dog = await this.dogsService.findOne(id);
      if (!dog) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: `User #${id} does not exist`,
        };
      }
      if (payload.user.id) {
        const user = await this.usersService.findById(payload.user.id);
        if (!user) {
          return {
            status_code: HttpStatus.BAD_REQUEST,
            message: `${payload?.user.id} does not exist`,
          };
        }
      }
      await this.dogsService.update(id, payload);
      console.log('payload: ', payload);

      return {
        status_code: HttpStatus.OK,
        message: `update dogId #${id} successful`,
        data: payload,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN)
  @Delete(':id/destroy')
  async destroy(@Param('id') id: number) {
    try {
      await this.dogsService.destroy(id);
      return {
        status_code: HttpStatus.OK,
        message: `delete dogId #${id} successful`,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }
}
