import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('music_nfts')
export class MusicNFT {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column()
  description: string;

  @Column()
  audioUrl: string;

  @Column()
  coverImageUrl: string;

  @Column()
  metadataIpfsUrl: string;

  @Column()
  ownerWalletAddress: string;

  @Column()
  smartContractAddress: string;

  @Column({ type: 'float' })
  royaltyPercentage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}