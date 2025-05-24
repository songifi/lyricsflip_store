import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BandMember } from './band-member.entity';

export enum InstrumentType {
  VOCALS = 'vocals',
  GUITAR = 'guitar',
  BASS = 'bass',
  DRUMS = 'drums',
  KEYBOARD = 'keyboard',
  PIANO = 'piano',
  VIOLIN = 'violin',
  SAXOPHONE = 'saxophone',
  TRUMPET = 'trumpet',
  FLUTE = 'flute',
  HARMONICA = 'harmonica',
  DJ = 'dj',
  PRODUCER = 'producer',
  SONGWRITER = 'songwriter',
  MANAGER = 'manager',
  OTHER = 'other',
}

@Entity('band_roles')
export class BandRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  memberId: string;

  @Column({
    type: 'enum',
    enum: InstrumentType,
  })
  instrument: InstrumentType;

  @Column({ length: 50, nullable: true })
  customRole: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => BandMember, (member) => member.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memberId' })
  member: BandMember;

  @CreateDateColumn()
  createdAt: Date;
}