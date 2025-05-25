@Entity()
export class GroupSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription)
  parentSubscription: Subscription;

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];
}
