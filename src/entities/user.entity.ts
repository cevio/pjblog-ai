import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

/**
 * USER: 普通用户
 * ADMIN: 管理员
 * SUPER_ADMIN: 超级管理员
 */
export enum USER_ROLE {
  USER,
  ADMIN,
  SUPER_ADMIN,
}

@Entity({ name: 'users', comment: '用户表' })
export class UserEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'id',
    comment: '用户主键ID'
  })
  public id!: number;

  @Column({
    type: 'varchar',
    length: 128,
    comment: '用户邮箱（唯一）'
  })
  @Index('idx_email', { unique: true })
  public email!: string

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '用户昵称'
  })
  public nickname?: string;

  @Column({
    type: 'integer',
    default: USER_ROLE.USER,
    comment: '用户角色'
  })
  public role!: USER_ROLE;

  @Column({
    type: 'text',
    comment: '用户头像',
    nullable: true,
  })
  public avatar?: string;

  @Column({
    type: 'text',
    comment: '个人网站',
    nullable: true,
  })
  public website?: string;

  @Column({
    type: 'text',
    comment: '个人简介',
    nullable: true,
  })
  public profile?: string;

  @Column({
    type: 'timestamp',
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP'
  })
  @Index('idx_created_time')
  public created_time!: Date;

  @Column({
    type: 'timestamp',
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP'
  })
  @Index('idx_updated_time')
  public updated_time!: Date;
}
