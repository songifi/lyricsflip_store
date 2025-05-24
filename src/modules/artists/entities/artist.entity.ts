import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Exclude } from "class-transformer"
import { ArtistRole } from "../enums/artistRole.enum"
import { VerificationStatus } from "../enums/verificationStatus.enum"
import { Album } from "src/modules/music/albums/entities/album.entity"

@Entity("artists")
export class Artist {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude()
  password: string

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string

  @Column({ nullable: true })
  @Exclude()
  verificationToken?: string

  @Column({ default: false })
  isEmailVerified: boolean

  @Column({
    type: "enum",
    enum: ArtistRole,
    default: ArtistRole.INDIVIDUAL,
  })
  role: ArtistRole

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus

  // Profile fields
  @Column()
  name: string

  @Column({ nullable: true })
  artisticName?: string

  @Column({ nullable: true })
  bio?: string

  @Column({ nullable: true })
  profileImageUrl?: string

  @Column({ nullable: true })
  coverImageUrl?: string

  @Column({ type: "simple-array", nullable: true })
  genres?: string[]

  @Column({ nullable: true })
  location?: string

  @Column({ nullable: true })
  website?: string

  @Column({ type: "simple-json", nullable: true })
  socialLinks?: {
    instagram?: string
    twitter?: string
    facebook?: string
    youtube?: string
    spotify?: string
    soundcloud?: string
    appleMusic?: string
  }

  // Relationships
    @OneToMany(() => Artist, (artist) => artist.albums, {
      onDelete: 'CASCADE',
      nullable: false,
    })
    albums: Album;

  @Column({ default: false })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
