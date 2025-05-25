import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DistributionRelease } from './distribution-release.entity';

@Entity('distribution_partners')
export class DistributionPartner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
  })
  platform: PlatformType;

  @Column()
  apiEndpoint: string;

  @Column({ type: 'json', nullable: true })
  apiCredentials: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  platformConfig: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  supportedFormats: string[];

  @Column({ type: 'json', nullable: true })
  metadataRequirements: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  revenueSplit: number;

  @OneToMany(() => DistributionRelease, release => release.partner)
  releases: DistributionRelease[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
