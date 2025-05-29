@Entity('analytics_event')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  source: string;

  @Column()
  event_type: string;

  @Column('jsonb')
  data: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
