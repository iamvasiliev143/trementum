import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { AccountEntity } from '../_system/db/entities/account.entity';
import { PostEntity } from '../_system/db/entities/post.entity';

import { humanizeNumber, round } from '../../common/utils/humanize-number.util';

import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { BestTimeQueryDto } from './dto/best-time-query.dto';
import { ConsistencyQueryDto } from './dto/consistency-query.dto';

import { BestTimeRaw } from './types/best-time.raw';
import { LeaderboardRaw } from './types/leaderboard.raw';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
  ) {}

  async leaderboard({ from, to, limit }: LeaderboardQueryDto) {
    const raw = await this.accountRepo
      .createQueryBuilder('a')
      .leftJoin(PostEntity, 'p', 'p.account_id = a.id')
      .where('p.created_at BETWEEN :from AND :to', { from, to })
      .select([
        'a.id as id',
        'a.full_name as full_name',
        'a.username as username',
        'a.followers_count as followers_count',
        'COUNT(p.id) as posts_count',
        'COALESCE(SUM(p.comments_count),0) as total_comments',
      ])
      .groupBy('a.id')
      .limit(limit)
      .getRawMany<LeaderboardRaw>();

    return raw.map((row) => {
      const followers = Number(row.followers_count) || 0;
      const posts = Number(row.posts_count) || 0;
      const comments = Number(row.total_comments) || 0;

      const engagement = followers > 0 ? (comments / followers) * 1000 : 0;

      return {
        id: row.id,
        full_name: row.full_name,
        username: row.username,

        followers_count: followers,
        followers_human: humanizeNumber(followers),

        posts_count: posts,
        total_comments: comments,
        total_comments_human: humanizeNumber(comments),

        engagement_per_1k: round(engagement, 2),
      };
    });
  }

  async bestPostingTime(id: string, query: BestTimeQueryDto) {
    const { from, to } = query;

    const raw = await this.postRepo
      .createQueryBuilder('p')
      .where('p.account_id = :id', { id })
      .andWhere('p.created_at BETWEEN :from AND :to', {
        from,
        to,
      })
      .select([
        'EXTRACT(DOW FROM p.created_at) as day_of_week',
        'EXTRACT(HOUR FROM p.created_at) as hour',
        'COUNT(p.id) as posts_count',
        'AVG(p.comments_count)::float as avg_comments',
      ])
      .groupBy('day_of_week, hour')
      .having('COUNT(p.id) >= 3')
      .orderBy('avg_comments', 'DESC')
      .getRawMany<BestTimeRaw>();

    if (!raw.length) return { message: 'Insufficient data' };

    return raw.map((row) => ({
      day_of_week: Number(row.day_of_week),
      hour: Number(row.hour),
      posts_count: Number(row.posts_count),
      avg_comments: round(Number(row.avg_comments), 2),
    }));
  }

  async consistency(id: string, query: ConsistencyQueryDto) {
    const { from, to } = query;

    const posts = await this.postRepo.find({
      where: {
        account_id: id,
        created_at: Between(new Date(from), new Date(to)),
      },
      order: { created_at: 'ASC' },
    });

    if (posts.length < 2) return { message: 'Insufficient data' };

    const gaps: number[] = [];

    for (let i = 1; i < posts.length; i++) {
      const diff =
        posts[i].created_at.getTime() - posts[i - 1].created_at.getTime();

      gaps.push(diff / (1000 * 60 * 60 * 24));
    }

    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;

    const variance = gaps.reduce((s, g) => s + (g - avg) ** 2, 0) / gaps.length;

    const std = Math.sqrt(variance);

    const totalDays =
      (new Date(to).getTime() - new Date(from).getTime()) /
      (1000 * 60 * 60 * 24);

    const activeDays = new Set(
      posts.map((p) => p.created_at.toISOString().slice(0, 10)),
    ).size;

    const activityRatio = totalDays > 0 ? activeDays / totalDays : 0;

    const consistencyScore = activityRatio * (1 / (1 + std));

    return {
      posts_in_range: posts.length,
      avg_gap_days: round(avg, 2),
      gap_std_dev: round(std, 2),
      activity_ratio: round(activityRatio, 3),
      consistency_score: round(consistencyScore, 3),
    };
  }
}
