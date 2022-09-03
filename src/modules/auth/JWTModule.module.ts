import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

@Module({
  imports: [
    {
      ...JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (
          configService: ConfigService,
        ): Promise<JwtModuleOptions> => {
          return {
            secret: process.env.SECRET,
            signOptions: {
              expiresIn: process.env.EXPIES_IN,
            },
          };
        },
      }),
      global: true,
    },
  ],
  exports: [JwtModule],
})
export class JWTModule {}
