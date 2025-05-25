import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Challenge } from './challenge.entity';

@Entity()
export class ChallengeParticipation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.challengeParticipations)
  participant: User;

  @ManyToOne(() => Challenge, challenge => challenge.participations)
  challenge: Challenge;

  @Column('text')
  submissionUrl: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @CreateDateColumn()
  submittedAt: Date;
}
