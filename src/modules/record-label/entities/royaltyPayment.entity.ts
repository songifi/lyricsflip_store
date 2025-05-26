import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LabelContract } from './label-contract.entity';

@Entity('royalty_payments')
export class RoyaltyPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossRevenue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  royaltyRate: number;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ type: 'json' })
  breakdown: {
    streaming: number;
    downloads: number;
    physical: number;
    sync: number;
    performance: number;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  paymentReference: string;

  // Relationships
  @Column({ name: 'contract_id' })
  contractId: string;

  @ManyToOne(() => LabelContract, (contract) => contract.royaltyPayments)
  @JoinColumn({ name: 'contract_id' })
  contract: LabelContract;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}