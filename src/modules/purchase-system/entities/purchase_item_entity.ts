// src/entities/purchase-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';
import { DigitalDownload } from './digital-download.entity';

export enum ItemType {
  MUSIC_DOWNLOAD = 'music_download',
  MERCHANDISE = 'merchandise',
  CONCERT_TICKET = 'concert_ticket',
  ALBUM = 'album',
  SINGLE = 'single',
}

export enum ItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  DELIVERED = 'delivered',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
}

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Purchase, purchase => purchase.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @Column({ name: 'purchase_id' })
  purchaseId: string;

  @Column({
    type: 'enum',
    enum: ItemType,
  })
  itemType: ItemType;

  @Column({ type: 'varchar', length: 255 })
  itemId: string; // Reference to the actual item (song, merchandise, ticket)

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  artistName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  albumName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.PENDING,
  })
  status: ItemStatus;

  @Column({ type: 'jsonb', nullable: true })
  attributes: {
    size?: string;
    color?: string;
    format?: string; // MP3, FLAC, etc.
    bitrate?: string;
    seatNumber?: string;
    venue?: string;
    eventDate?: string;
    [key: string]: any;
  };

  @OneToMany(() => DigitalDownload, download => download.purchaseItem)
  digitalDownloads: DigitalDownload[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  trackingNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier: string;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;
}