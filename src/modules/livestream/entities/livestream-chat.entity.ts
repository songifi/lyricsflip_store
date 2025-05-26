import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { LiveStream } from "./livestream.entity"
import { User } from "../../users/entities/user.entity"

@Entity("livestream_chat")
export class LiveStreamChat {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "text" })
  message: string

  @Column({
    type: "enum",
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType

  @Column({ default: false })
  isModerated: boolean

  @Column({ default: false })
  isDeleted: boolean

  @Column({ type: "json", nullable: true })
  metadata: {
    emoji?: string
    mentions?: string[]
    links?: string[]
  }

  @ManyToOne(() => LiveStream)
  @JoinColumn({ name: "liveStreamId" })
  liveStream: LiveStream

  @Column()
  liveStreamId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @Column()
  userId: string

  @CreateDateColumn()
  createdAt: Date
}
