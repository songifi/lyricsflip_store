import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TasteProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('float', { array: true })
  genreVector: number[];

  @Column('float', { array: true })
  moodVector: number[];

  @Column('float', { array: true })
  tempoRange: number[];

  @Column({ nullable: true })
  contextPreference: string;
}
