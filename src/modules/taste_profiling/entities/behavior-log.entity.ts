import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class BehaviorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  trackId: string;

  @Column()
  genre: string;

  @Column()
  mood: string;

  @Column()
  tempo: number;

  @CreateDateColumn()
  listenedAt: Date;
}
