import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Band } from './band.entity';
import { User } from './user.entity';
import { BandRole } from './band-role.entity';
import { RevenueShare } from './revenue-share.entity';

@Entity('band_members')
export class BandMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  bandId: string;

  @Column({ uuid: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: MemberPermission,
    default: MemberPermission.MEMBER,
  })
  permission: MemberPermission;

  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.ACTIVE,
  })
  status: MemberStatus;

  @Column({ type: 'date' })
  joinedDate: Date;

  @Column({ type: 'date', nullable: true })
  leftDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Band, (band) => band.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bandId' })
  band: Band;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => BandRole, (role) => role.member, { cascade: true })
  roles: BandRole[];

  @OneToMany(() => RevenueShare, (share) => share.member)
  revenueShares: RevenueShare[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}