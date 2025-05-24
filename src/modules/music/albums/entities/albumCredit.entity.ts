import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Album } from './album.entity';
import { CreditRole } from '../enums/creditRole.enum';

@Entity('album_credits')
@Index(['album_id', 'role'])
export class AlbumCredit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: CreditRole,
  })
  role: CreditRole;

  @Column({ length: 255, nullable: true })
  custom_role: string; // for roles not in enum

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @ManyToOne(() => Album, (album) => album.credits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'album_id' })
  album: Album;

  @Column('uuid')
  album_id: string;
}