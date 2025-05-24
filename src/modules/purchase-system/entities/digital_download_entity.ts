// src/entities/digital-download.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PurchaseItem } from './purchase-item.entity';
import { User } from './user.entity';

export enum DownloadStatus {
  PENDING = 'pending',
  READY = 'ready',
  DOWNLOADED = 'downloaded',
  EXPIRED = 'expired',
}

@Entity('digital_downloads')
export class DigitalDownload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PurchaseItem, item => item.digitalDownloads)
  @JoinColumn({ name: 'purchase_item_id' })
  purchaseItem: PurchaseItem;

  @Column({ name: 'purchase_item_id' })
  purchaseItemId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', length: 500 })
  secureUrl: string;

  @Column({ type: 'varchar', length: 100 })
  fileFormat: string; // MP3, FLAC, WAV, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  bitrate: string;

  @Column({ type: 'bigint' })
  fileSize: number; // in bytes

  @Column({ type: 'varchar', length: 64 })
  fileHash: string; // SHA-256 hash for integrity

  @Column({
    type: 'enum',
    enum: DownloadStatus,
    default: DownloadStatus.PENDING,
  })
  status: DownloadStatus;

  @Column({ type: 'varchar', length: 255, unique: true })
  downloadToken: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'int', default: 5 })
  maxDownloads: number;

  @Column({ type: 'timestamp', nullable: true })
  firstDownloadAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDownloadAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  downloadLog: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
    trackNumber?: number;
    duration?: number;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}