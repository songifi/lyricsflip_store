@Entity()
export class FanClub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, user => user.ownedFanClubs, { eager: true })
  owner: User;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => ExclusiveContent, content => content.fanClub, { cascade: true })
  exclusiveContents: ExclusiveContent[];

  @Column({ default: 0 })
  memberCount: number;
}

@Entity()
export class ExclusiveContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  contentUrl: string;

  @ManyToOne(() => FanClub, fanClub => fanClub.exclusiveContents)
  fanClub: FanClub;

  @CreateDateColumn()
  createdAt: Date;
}
