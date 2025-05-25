// src/entities/event.entity.ts
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
import { Venue } from './venue.entity';
import { Ticket } from './ticket.entity';
import { EventPromotion } from './event-promotion.entity';
import { EventAnalytics } from './event-analytics.entity';
import { EventCheckIn } from './event-checkin.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum EventType {
  CONCERT = 'concert',
  TOUR = 'tour',
  FESTIVAL = 'festival',
  SHOW = 'show',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.CONCERT,
  })
  type: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  doorOpenTime: Date;

  @Column({ type: 'uuid' })
  venueId: string;

  @ManyToOne(() => Venue, (venue) => venue.events)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column({ length: 100 })
  artistName: string;

  @Column('simple-array', { nullable: true })
  supportingActs: string[];

  @Column('text', { nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice: number;

  @Column({ type: 'int', default: 0 })
  totalCapacity: number;

  @Column({ type: 'int', default: 0 })
  soldTickets: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @OneToMany(() => EventPromotion, (promotion) => promotion.event)
  promotions: EventPromotion[];

  @OneToMany(() => EventAnalytics, (analytics) => analytics.event)
  analytics: EventAnalytics[];

  @OneToMany(() => EventCheckIn, (checkIn) => checkIn.event)
  checkIns: EventCheckIn[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}