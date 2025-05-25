import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { FanClub } from './fanclub.entity';

@Entity()
export class ExclusiveContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  contentUrl: string;

  @ManyToOne(() => FanClub, fanClub => fanClub.exclusiveContents)
  fanClub: FanClub;

  @CreateDateColumn()
  createdAt: Date;
}
