import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Label } from './label.entity';

@Entity('label_branding')
export class LabelBranding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['logo', 'color_palette', 'typography', 'template', 'asset'], default: 'asset' })
  type: string;

  @Column({ type: 'json' })
  config: {
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts?: {
      primary: string;
      secondary: string;
      weights: string[];
    };
    logos?: {
      main: string;
      icon: string;
      horizontal: string;
      vertical: string;
    };
    templates?: {
      type: string;
      url: string;
      dimensions: { width: number; height: number };
    };
  };

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  usage: {
    platforms: string[];
    contexts: string[];
    restrictions: string[];
  };

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @Column({ name: 'label_id' })
  labelId: string;

  @ManyToOne(() => Label, (label) => label.branding)
  @JoinColumn({ name: 'label_id' })
  label: Label;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}