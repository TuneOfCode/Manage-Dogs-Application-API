import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';
import { DogSchema } from './entity/dog.entity';

@Module({
  controllers: [DogsController],
  providers: [DogsService],
  imports: [TypeOrmModule.forFeature([DogSchema]), UsersModule],
  exports: [DogsService],
})
export class DogsModule {}
