// src/entities/event-checkin.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Ticket } from './ticket.entity';

export enum CheckInMethod {
  QR_CODE = 'qr_code',
  MANUAL = 'manual',
  NFC = 'nfc',
  MOBILE_APP = 'mobile_app',
}

export enum CheckInStatus {
  SUCCESS = 'success',
  DUPLICATE = 'duplicate',
  INVALID_TICKET = 'invalid_ticket',
  EVENT_NOT_STARTED = 'event_not_started',
  CANCELLED_TICKET = 'cancelled_ticket',
  WRONG_EVENT = 'wrong_event',
}

@Entity('event_checkins')
export class EventCheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.checkIns)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.checkIns)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column({
    type: 'enum',
    enum: CheckInMethod,
    default: CheckInMethod.QR_CODE,
  })
  method: CheckInMethod;

  @Column({
    type: 'enum',
    enum: CheckInStatus,
    default: CheckInStatus.SUCCESS,
  })
  status: CheckInStatus;

  @Column({ type: 'timestamp' })
  checkedInAt: Date;

  @Column({ length: 100, nullable: true })
  checkedInBy: string; // Staff member or system

  @Column({ length: 45, nullable: true })
  deviceId: string;

  @Column({ length: 100, nullable: true })
  deviceType: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 200, nullable: true })
  location: string; // Gate/entrance location

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  requiresManualVerification: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ length: 100, nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column('simple-json', { nullable: true })
  additionalData: {
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
    temperature?: number;
    attendeePhoto?: string;
    signatureRequired?: boolean;
    signature?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Computed properties
  get isSuccessful(): boolean {
    return this.status === CheckInStatus.SUCCESS;
  }

  get isDuplicate(): boolean {
    return this.status === CheckInStatus.DUPLICATE;
  }
}