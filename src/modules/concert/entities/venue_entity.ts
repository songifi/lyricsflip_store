// src/entities/venue.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 300 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  zipCode: string;

  @Column({ length: 100 })
  country: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 200, nullable: true })
  website: string;

  @Column('simple-array', { nullable: true })
  amenities: string[];

  @Column('simple-json', { nullable: true })
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column('simple-json', { nullable: true })
  parkingInfo: {
    available: boolean;
    capacity?: number;
    fee?: number;
    description?: string;
  };

  @Column('simple-json', { nullable: true })
  accessibilityInfo: {
    wheelchairAccessible: boolean;
    hearingAssistance: boolean;
    visualAssistance: boolean;
    description?: string;
  };

  @OneToMany(() => Event, (event) => event.venue)
  events: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}