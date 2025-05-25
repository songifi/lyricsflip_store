import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class SearchEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  term: string;

  @CreateDateColumn()
  searchedAt: Date;
}
