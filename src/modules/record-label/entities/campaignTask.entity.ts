import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReleaseCampaign } from './release-campaign.entity';
import { User } from '../../users/entities/user.entity';

@Entity('campaign_tasks')
export class CampaignTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['todo', 'in_progress', 'completed', 'cancelled'], default: 'todo' })
  status: string;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    category: string;
    tags: string[];
    attachments: string[];
  };

  // Relationships
  @Column({ name: 'campaign_id' })
  campaignId: string;

  @ManyToOne(() => ReleaseCampaign, (campaign) => campaign.tasks)
  @JoinColumn({ name: 'campaign_id' })
  campaign: ReleaseCampaign;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}