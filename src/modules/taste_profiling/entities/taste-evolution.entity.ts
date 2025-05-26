import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class TasteEvolution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('float', { array: true })
  genreSnapshot: number[];

  @Column('float', { array: true })
  moodSnapshot: number[];

  @Column('float', { array: true })
  tempoSnapshot: number[];

  @CreateDateColumn()
  capturedAt: Date;
}
