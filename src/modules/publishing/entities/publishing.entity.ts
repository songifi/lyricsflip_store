import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Songwriter } from './songwriter.entity';

@Entity()
export class Publishing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  songTitle: string;

  @Column()
  isrc: string;

  @OneToMany(() => Songwriter, songwriter => songwriter.publishing, { cascade: true })
  songwriters: Songwriter[];
}
