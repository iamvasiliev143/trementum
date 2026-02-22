import { join } from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

import { readCsv } from '../../../../utils/read-csv';

import { PostEntity } from '../entities/post.entity';

export class Posts1000000000001 implements MigrationInterface {
  private readonly CHUNK_SIZE: number = 1000;

  private posts: PostEntity[] = [];

  async up(queryRunner: QueryRunner) {
    const accountsRows = await readCsv(
      join(__dirname.replace('dist', 'src'), '1000000000000-accounts.csv'),
    );
    const postsRows = <Record<string, string>[]>(
      (<unknown>(
        await readCsv(
          join(__dirname.replace('dist', 'src'), '1000000000001-posts.csv'),
        )
      ))
    );

    this.posts = postsRows
      .map((postRow: Record<string, string>) => {
        const accountsRow = <Record<string, string>>(
          accountsRows.find(
            (accountRow) =>
              postRow.profile_id === accountRow.id ||
              postRow.profile_id === accountRow.id_alt,
          )
        );

        if (accountsRow) {
          return {
            id: postRow.id,
            text: postRow.text_original,
            comments_count: +postRow.comments_count,
            account_id: accountsRow.id,
            created_at: new Date(postRow.created_time),
          };
        }

        return null;
      })
      .filter((post) => !!post);

    if (!this.posts.length) {
      return;
    }

    for (let i = 0; i < this.posts.length; i += this.CHUNK_SIZE) {
      const chunk = this.posts.slice(i, i + this.CHUNK_SIZE);

      await queryRunner.manager.getRepository(PostEntity).insert(chunk);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (!this.posts.length) {
      return;
    }

    for (let i = 0; i < this.posts.length; i += this.CHUNK_SIZE) {
      const chunk = this.posts.slice(i, i + this.CHUNK_SIZE);

      await queryRunner.manager
        .getRepository(PostEntity)
        .delete(chunk.map((u) => u.id));
    }
  }
}
