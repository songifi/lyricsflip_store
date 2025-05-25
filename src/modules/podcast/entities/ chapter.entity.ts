import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Episode } from "./episode.entity"

@Entity("chapters")
export class Chapter {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text", { nullable: true })
  description: string

  @Column("int")
  startTime: number // in seconds

  @Column("int")
  endTime: number // in seconds

  @Column({ length: 500, nullable: true })
  imageUrl: string

  @Column({ length: 500, nullable: true })
  url: string // external link

  @Column("int")
  chapterNumber: number

  @Column("uuid")
  episodeId: string

  @ManyToOne(
    () => Episode,
    (episode) => episode.chapters,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "episodeId" })
  episode: Episode

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
