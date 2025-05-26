import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { User } from '../../users/entities/user.entity';
import { EstateRights } from './estate-rights.entity';
import { EstateInheritance } from './estate-inheritance.entity';

@Entity('estates')
@Index(['artistId', 'status'])
export class Estate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  estateName: string;

  @Column({
    type: 'enum',
    enum: EstateStatus,
    default: EstateStatus.ACTIVE,
  })
  status: EstateStatus;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'date', nullable: true })
  artistDeathDate: Date;

  // Legal information
  @Column({ type: 'jsonb', nullable: true })
  legalInformation: {
    willExists?: boolean;
    willLocation?: string;
    probateCourtCase?: string;
    legalRepresentative?: string;
    contactInformation?: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    trustInformation?: {
      trustName: string;
      trusteeNames: string[];
      beneficiaries: string[];
    };
  };

  // Financial information
  @Column({ type: 'jsonb', nullable: true })
  financialInformation: {
    estimatedValue?: number;
    currency?: string;
    lastValuation?: Date;
    revenueStreams?: Array<{
      source: string;
      type: string;
      estimatedAnnualRevenue: number;
    }>;
    debts?: Array<{
      creditor: string;
      amount: number;
      status: string;
    }>;
  };

  @Column({ type: 'uuid' })
  artistId: string;

  @ManyToOne(() => Artist)
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @Column({ type: 'uuid', nullable: true })
  primaryContactId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'primaryContactId' })
  primaryContact: User;

  @OneToMany(() => EstateRights, rights => rights.estate)
  rights: EstateRights[];

  @OneToMany(() => EstateInheritance, inheritance => inheritance.estate)
  inheritances: EstateInheritance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}