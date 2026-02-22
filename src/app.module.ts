import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/_system/config/config.module';
import { DBModule } from './modules/_system/db/db.module';
import { LoggerModule } from './modules/_system/logger/logger.module';

import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [ConfigModule, DBModule, LoggerModule, AnalyticsModule],
})
export class AppModule {}
