@Entity()
export class SocialAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string; // e.g. "post_view", "comment_added", "message_sent", etc.

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
