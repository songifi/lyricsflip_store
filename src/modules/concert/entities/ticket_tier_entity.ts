// src/entities/ticket-tier.entity.ts
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
import { Event } from './event.entity';
import { Ticket } from './ticket.entity';

export enum TierType {
  GENERAL_ADMISSION = 'general_admission',
  VIP = 'vip',
  PREMIUM = 'premium',
  EARLY_BIRD = 'early_bird',
  STUDENT = 'student',
  SENIOR = 'senior',
}

@Entity('ticket_tiers')
export class TicketTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TierType,
    default: TierType.GENERAL_ADMISSION,
  })
  type: TierType;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceFee: number;

  @Column({ type: 'int' })
  totalQuantity: number;

  @Column({ type: 'int', default: 0 })
  soldQuantity: number;

  @Column({ type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ type: 'int', nullable: true })
  maxPerOrder: number;

  @Column({ type: 'timestamp', nullable: true })
  saleStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  saleEndDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column('simple-array', { nullable: true })
  benefits: string[];

  @Column('simple-json', { nullable: true })
  restrictions: {
    ageLimit?: number;
    identificationRequired?: boolean;
    transferable?: boolean;
    refundable?: boolean;
  };

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => Ticket, (ticket) => ticket.tier)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get availableQuantity(): number {
    return this.totalQuantity - this.soldQuantity - this.reservedQuantity;
  }

  get isSoldOut(): boolean {
    return this.availableQuantity <= 0;
  }

  get finalPrice(): number {
    return this.price + this.serviceFee;
  }
}