// src/entities/receipt.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';
import { User } from './user.entity';

export enum ReceiptType {
  PURCHASE = 'purchase',
  REFUND = 'refund',
  GIFT = 'gift',
}

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Purchase, purchase => purchase.receipts)
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @Column({ name: 'purchase_id' })
  purchaseId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({
    type: 'enum',
    enum: ReceiptType,
    default: ReceiptType.PURCHASE,
  })
  type: ReceiptType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb' })
  itemDetails: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    itemType: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  taxDetails: {
    taxRate: number;
    taxAmount: number;
    taxType: string;
  };

  @Column({ type: 'varchar', length: 500, nullable: true })
  pdfUrl: string;

  @Column({ type: 'boolean', default: false })
  emailSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}