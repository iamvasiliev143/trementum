import { join } from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

import { readCsv } from '../../../../utils/read-csv';

import { AccountEntity } from '../entities/account.entity';

export class Accounts1000000000000 implements MigrationInterface {
  private readonly CHUNK_SIZE: number = 1000;

  private accounts: AccountEntity[] = [];

  async up(queryRunner: QueryRunner) {
    const accountRows = await readCsv(
      join(__dirname.replace('dist', 'src'), '1000000000000-accounts.csv'),
    );

    const followersCountRows = await readCsv(
      join(
        __dirname.replace('dist', 'src'),
        '1000000000000-sources_for_followers.csv',
      ),
    );

    this.accounts = accountRows.map((accountRow: Record<string, string>) => {
      const followersCountRow = followersCountRows.find(
        (x) => x._id === accountRow._id,
      );

      return {
        id: accountRow.id,
        full_name: accountRow.full_name,
        username: accountRow.username,
        followers_count: Number(followersCountRow?.followers_count || 0),
      };
    });

    if (!this.accounts.length) {
      return;
    }

    for (let i = 0; i < this.accounts.length; i += this.CHUNK_SIZE) {
      const chunk = this.accounts.slice(i, i + this.CHUNK_SIZE);

      await queryRunner.manager.getRepository(AccountEntity).insert(chunk);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (!this.accounts.length) {
      return;
    }

    for (let i = 0; i < this.accounts.length; i += this.CHUNK_SIZE) {
      const chunk = this.accounts.slice(i, i + this.CHUNK_SIZE);

      await queryRunner.manager
        .getRepository(AccountEntity)
        .delete(chunk.map((u) => u.id));
    }
  }
}
