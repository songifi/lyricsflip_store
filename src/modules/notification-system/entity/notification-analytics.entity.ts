import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class NotificationAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  notificationId: string;

  @Column()
  userId: string;

  @Column({ default: false })
  delivered: boolean;

  @Column({ default: false })
  opened: boolean;

  @Column({ default: false })
  clicked: boolean;

  @CreateDateColumn()
  timestamp: Date;
}