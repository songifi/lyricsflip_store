import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './post.entity';
import { Message } from './message.entity';
import { Comment } from './comment.entity';
import { FanClub } from './fan-club.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => FanClub, fanClub => fanClub.owner)
  ownedFanClubs: FanClub[];
}
