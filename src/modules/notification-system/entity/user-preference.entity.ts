import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity()
export class UserNotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: true })
  push: boolean;

  @Column({ default: true })
  email: boolean;

  @Column('simple-array')
  enabledTypes: string[];

  @UpdateDateColumn()
  updatedAt: Date;
}