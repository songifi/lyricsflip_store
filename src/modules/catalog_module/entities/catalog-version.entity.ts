import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Catalog } from './catalog.entity';

@Entity()
export class CatalogVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Catalog)
  @JoinColumn()
  catalog: Catalog;

  @Column('jsonb')
  snapshot: Record<string, any>;

  @Column()
  version: number;

  @CreateDateColumn()
  createdAt: Date;
}
