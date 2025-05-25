// src/entities/ticket.entity.ts
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
import { TicketTier } from './ticket-tier.entity';
import { EventCheckIn } from './event-checkin.entity';

export enum TicketStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketNumber: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'uuid' })
  tierId: string;

  @ManyToOne(() => TicketTier, (tier) => tier.tickets)
  @JoinColumn({ name: 'tierId' })
  tier: TicketTier;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.AVAILABLE,
  })
  status: TicketStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ length: 100, nullable: true })
  purchaserName: string;

  @Column({ length: 100, nullable: true })
  purchaserEmail: string;

  @Column({ length: 20, nullable: true })
  purchaserPhone: string;

  @Column({ type: 'timestamp', nullable: true })
  purchaseDate: Date;

  @Column({ length: 100, nullable: true })
  paymentId: string;

  @Column({ length: 20, nullable: true })
  seatNumber: string;

  @Column({ length: 10, nullable: true })
  row: string;

  @Column({ length: 10, nullable: true })
  section: string;

  @Column({ type: 'text', nullable: true })
  qrCode: string;

  @Column({ type: 'boolean', default: false })
  isCheckedIn: boolean;

  @Column({ type: 'timestamp', nullable: true })
  checkedInAt: Date;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => EventCheckIn, (checkIn) => checkIn.ticket)
  checkIns: EventCheckIn[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}