import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('model_metadata')
export class ModelMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ModelType,
  })
  modelType: ModelType;

  @Column()
  version: string;

  @Column('jsonb')
  parameters: Record<string, any>;

  @Column('jsonb')
  metrics: Record<string, any>;

  @Column('text', { nullable: true })
  modelPath: string;

  @Column('boolean', { default: false })
  isActive: boolean;

  @Column('timestamp', { nullable: true })
  trainedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}