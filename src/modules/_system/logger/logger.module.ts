import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as NestLoggerModule } from 'nestjs-pino';

import { NodeEnv } from '../../../common/types/env';
import { envDto } from '../../../config/validate-env';

@Global()
@Module({
  imports: [
    NestLoggerModule.forRootAsync({
      providers: undefined,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<envDto>) => ({
        pinoHttp: {
          level: configService.get('LOG_LEVEL') || 'info',

          transport:
            configService.get('NODE_ENV') === NodeEnv.development
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    colorize: true,
                  },
                }
              : undefined,

          autoLogging: true,
        },
      }),
    }),
  ],
})
export class LoggerModule {}
