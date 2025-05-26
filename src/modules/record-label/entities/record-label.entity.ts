import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { LabelContract } from './label-contract.entity';
import { ReleaseCampaign } from './release-campaign.entity';
import { LabelBranding } from './label-branding.entity';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: string;

  @Column({ type: 'json', nullable: true })
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    spotify?: string;
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defaultRoyaltyRate: number;

  @Column({ type: 'json', nullable: true })
  businessInfo: {
    registrationNumber?: string;
    taxId?: string;
    businessType?: string;
  };

  // Relationships
  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Artist, (artist) => artist.label)
  artists: Artist[];

  @OneToMany(() => LabelContract, (contract) => contract.label)
  contracts: LabelContract[];

  @OneToMany(() => ReleaseCampaign, (campaign) => campaign.label)
  releaseCampaigns: ReleaseCampaign[];

  @OneToMany(() => LabelBranding, (branding) => branding.label)
  branding: LabelBranding[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}