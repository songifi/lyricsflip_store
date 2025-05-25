@Entity('chart_entries')
export class ChartEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  trackId: number;

  @Column()
  artistId: number;

  @Column()
  metric: string; // 'plays' | 'sales' | 'engagement'

  @Column('float')
  value: number;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;
}
