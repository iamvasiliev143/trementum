import { join } from 'path';

import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';

import { EntityManager } from 'typeorm';

import { NodeEnv } from '../../../common/types/env';

import { envDto } from '../../../config/validate-env';

import { AccountEntity } from './entities/account.entity';
import { PostEntity } from './entities/post.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<envDto>) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: configService.get('NODE_ENV') === NodeEnv.development,
        entities: [AccountEntity, PostEntity],
        logging: configService.get('NODE_ENV') === NodeEnv.development,
        migrations: [
          join(__dirname, 'migrations/*.js'),
          join(__dirname, 'seeds/*.js'),
        ],
      }),
    }),
  ],
})
export class DBModule implements OnModuleInit {
  constructor(protected readonly moduleRef: ModuleRef) {}

  async onModuleInit() {
    try {
      console.log('MIGRATIONS: Running...');

      const entityManager: EntityManager = this.moduleRef.get(
        getEntityManagerToken(),
        {
          strict: false,
        },
      );
      await entityManager.connection.runMigrations();

      console.log('MIGRATIONS: Finished');
    } catch (error) {
      console.error(error);
    }
  }
}
