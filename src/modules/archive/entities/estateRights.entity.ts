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

@Entity('estate_rights')
export class EstateRights {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RightsType,
  })
  rightsType: RightsType;

  @Column({
    type: 'enum',
    enum: RightsStatus,
    default: RightsStatus.ACTIVE,
  })
  status: RightsStatus;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'date', nullable: true })
  acquisitionDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  territory: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ownershipPercentage: number;

  @Column({ type: 'jsonb', nullable: true })
  rightsDetails: {
    registrationNumber?: string;
    registrationOffice?: string;
    originalOwner?: string;
    currentLicensees?: Array<{
      licensee: string;
      licenseType: string;
      startDate: Date;
      endDate?: Date;
      royaltyRate?: number;
    }>;
    restrictions?: string[];
    notes?: string;
  };

  @Column({ type: 'uuid' })
  estateId: string;

  @ManyToOne(() => Estate, estate => estate.rights)
  @JoinColumn({ name: 'estateId' })
  estate: Estate;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}