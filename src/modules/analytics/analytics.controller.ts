import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';

import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { BestTimeQueryDto } from './dto/best-time-query.dto';
import { ConsistencyQueryDto } from './dto/consistency-query.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({
    summary: 'Leaderboard (engagement normalized by followers)',
  })
  @Get('leaderboard')
  leaderboard(@Query() query: LeaderboardQueryDto) {
    return this.analyticsService.leaderboard(query);
  }

  @ApiOperation({
    summary: 'Best posting time per profile',
  })
  @Get('profiles/:id/best-time')
  bestPostingTime(@Param('id') id: string, @Query() query: BestTimeQueryDto) {
    return this.analyticsService.bestPostingTime(id, query);
  }

  @ApiOperation({
    summary: 'Consistency score per profile',
  })
  @Get('profiles/:id/consistency')
  consistency(@Param('id') id: string, @Query() query: ConsistencyQueryDto) {
    return this.analyticsService.consistency(id, query);
  }
}
