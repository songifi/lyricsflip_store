import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Band } from './band.entity';
import { User } from './user.entity';

export enum MessageType {
  TEXT = 'text',
  ANNOUNCEMENT = 'announcement',
  FILE = 'file',
  AUDIO = 'audio',
  IMAGE = 'image',
}

@Entity('band_messages')
export class BandMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  bandId: string;

  @Column({ uuid: true })
  senderId: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  attachments: {
    fileName?: string;
    fileUrl?: string;
    fileSize?: number;
    mimeType?: string;
  }[];

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'json', nullable: true })
  readBy: Record<string, Date>;

  @ManyToOne(() => Band, (band) => band.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bandId' })
  band: Band;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}