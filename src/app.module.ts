import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { defaultConfigDBAsync } from './config/';
import { dest } from './constants/';
import { AuthModule } from './modules/auth/auth.module';
import { RoleGuard } from './modules/auth/guard/role-guard';
import { DogsModule } from './modules/dogs/dogs.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    DogsModule,
    UsersModule,
    AuthModule,
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: dest.ROOT,
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.dev' }),
    TypeOrmModule.forRootAsync(defaultConfigDBAsync),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
