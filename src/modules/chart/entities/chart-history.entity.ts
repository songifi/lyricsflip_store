@Entity('chart_histories')
export class ChartHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chartEntryId: number;

  @ManyToOne(() => ChartEntry)
  @JoinColumn()
  chartEntry: ChartEntry;

  @Column()
  milestone: string;

  @CreateDateColumn()
  createdAt: Date;
}
