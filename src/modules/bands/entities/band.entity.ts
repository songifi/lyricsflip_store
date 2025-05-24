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
import { BandMember } from './band-member.entity';
import { Collaboration } from './collaboration.entity';
import { BandAlbum } from './band-album.entity';
import { BandMessage } from './band-message.entity';
import { User } from './user.entity';

export enum BandStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISBANDED = 'disbanded',
}

@Entity('bands')
export class Band {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  genre: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column({ type: 'json', nullable: true })
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };

  @Column({
    type: 'enum',
    enum: BandStatus,
    default: BandStatus.ACTIVE,
  })
  status: BandStatus;

  @Column({ type: 'date', nullable: true })
  formedDate: Date;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ uuid: true })
  founderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'founderId' })
  founder: User;

  @OneToMany(() => BandMember, (member) => member.band, { cascade: true })
  members: BandMember[];

  @OneToMany(() => Collaboration, (collaboration) => collaboration.band)
  collaborations: Collaboration[];

  @OneToMany(() => BandAlbum, (album) => album.band)
  albums: BandAlbum[];

  @OneToMany(() => BandMessage, (message) => message.band)
  messages: BandMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}