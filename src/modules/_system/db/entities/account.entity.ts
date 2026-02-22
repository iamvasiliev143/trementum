import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { PostEntity } from './post.entity';

@Entity({
  name: 'accounts',
})
export class AccountEntity {
  @ApiProperty({
    type: BigInt,
  })
  @PrimaryColumn({
    type: 'bigint',
  })
  public id!: string;

  @ApiProperty({
    type: String,
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  public full_name!: string;

  @ApiProperty({
    type: String,
    maxLength: 255,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public username!: null | string;

  @ApiProperty({
    type: Number,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  public followers_count!: number;

  @ApiProperty({
    type: () => PostEntity,
    isArray: true,
    required: false,
  })
  @OneToMany(() => PostEntity, (entity) => entity.account)
  @JoinColumn({ name: 'account_id' })
  public posts?: Relation<PostEntity>[];
}
