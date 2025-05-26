import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Estate } from './estate.entity';
import { User } from '../../users/entities/user.entity';

@Entity('estate_inheritances')
export class EstateInheritance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: InheritanceType,
  })
  inheritanceType: InheritanceType;

  @Column({
    type: 'enum',
    enum: InheritanceStatus,
    default: InheritanceStatus.ACTIVE,
  })
  status: InheritanceStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  inheritancePercentage: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  relationshipToArtist: string;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  inheritanceDetails: {
    specificAssets?: string[];
    restrictions?: string[];
    conditions?: string[];
    legalDocuments?: string[];
    contactInformation?: {
      email: string;
      phone: string;
      address: string;
    };
    notes?: string;
  };

  @Column({ type: 'uuid' })
  estateId: string;

  @ManyToOne(() => Estate, estate => estate.inheritances)
  @JoinColumn({ name: 'estateId' })
  estate: Estate;

  @Column({ type: 'uuid', nullable: true })
  inheriteeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'inheriteeId' })
  inheritee: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}