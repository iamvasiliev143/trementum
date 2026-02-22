import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { AccountEntity } from './account.entity';

@Entity({
  name: 'posts',
  orderBy: {
    created_at: 'DESC',
  },
})
@Index(['account_id', 'created_at'])
export class PostEntity {
  @ApiProperty({
    type: BigInt,
  })
  @PrimaryColumn({
    type: 'bigint',
  })
  public id!: string;

  @ApiProperty({
    type: String,
  })
  @Column({ type: 'text' })
  public text!: string;

  @ApiProperty({
    type: Number,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  public comments_count!: number;

  @ApiProperty({
    type: BigInt,
  })
  @Column({ type: 'bigint' })
  account_id!: string;

  @ApiProperty({
    type: () => AccountEntity,
    required: false,
    nullable: true,
  })
  @ManyToOne(() => AccountEntity, (entity) => entity.posts)
  @JoinColumn({ name: 'account_id' })
  public account?: Relation<AccountEntity>;

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 0,
  })
  public readonly created_at!: Date;
}
