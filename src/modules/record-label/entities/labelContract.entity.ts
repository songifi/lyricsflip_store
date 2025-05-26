import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Label } from './label.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { RoyaltyPayment } from './royalty-payment.entity';

@Entity('label_contracts')
export class LabelContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractNumber: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: ['active', 'expired', 'terminated', 'pending'], default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  royaltyRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  advanceAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  recoupedAmount: number;

  @Column({ type: 'json' })
  terms: {
    albumCommitment: number;
    exclusivity: boolean;
    territories: string[];
    rights: string[];
    marketingCommitment: number;
    tourSupport: boolean;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  contractDocument: string;

  // Relationships
  @Column({ name: 'label_id' })
  labelId: string;

  @ManyToOne(() => Label, (label) => label.contracts)
  @JoinColumn({ name: 'label_id' })
  label: Label;

  @Column({ name: 'artist_id' })
  artistId: string;

  @ManyToOne(() => Artist, { eager: true })
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @OneToMany(() => RoyaltyPayment, (payment) => payment.contract)
  royaltyPayments: RoyaltyPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}