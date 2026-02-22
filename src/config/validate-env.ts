import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { LevelWithSilentOrString } from 'pino';

import { IsIpOrHost } from '../common/decorators/is-ip-or-host.decorator';

import { NodeEnv } from '../common/types/env';

export class envDto {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.development;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  LOG_LEVEL: LevelWithSilentOrString = 'debug';

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  APP_PORT: number = 3000;

  @IsOptional()
  @IsIpOrHost()
  @MaxLength(100)
  DB_HOST: string = 'localhost';

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5432;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  DB_USER: string = 'root';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  DB_PASSWORD: string = 'root';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  DB_NAME: string = 'trementum';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  SWAGGER_TITLE: string = 'API';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  SWAGGER_DESCRIPTION: string = 'API documentation';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  SWAGGER_VERSION: string = '1.0.0';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  SWAGGER_PATH: string = 'docs';
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(envDto, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
