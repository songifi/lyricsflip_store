import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { Repository } from "typeorm"
import { Artist } from "../entities/artist.entity"
import { UpdateArtistProfileDto } from "../dto/update-artist-profile.dto"
import { VerificationStatus } from "../enums/verificationStatus.enum"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}
  async findAll(): Promise<Artist[]> {
    return this.artistRepository.find({
      where: { isActive: true },
      select: [
        "id",
        "name",
        "artisticName",
        "bio",
        "profileImageUrl",
        "coverImageUrl",
        "genres",
        "location",
        "website",
        "socialLinks",
        "verificationStatus",
        "role",
      ],
    })
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { id } })
    if (!artist) {
      throw new NotFoundException("Artist not found")
    }
    return artist
  }

  async findByEmail(email: string): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { email } })
    if (!artist) {
      throw new NotFoundException("Artist not found")
    }
    return artist
  }

  async updateProfile(id: string, updateArtistProfileDto: UpdateArtistProfileDto): Promise<Artist> {
    const artist = await this.findOne(id)

    // If email is being updated, check if it's already in use
    if (updateArtistProfileDto.email && updateArtistProfileDto.email !== artist.email) {
      const existingArtist = await this.artistRepository.findOne({ where: { email: updateArtistProfileDto.email } })
      if (existingArtist) {
        throw new BadRequestException("Email is already in use")
      }

      // Reset email verification if email is changed
      artist.isEmailVerified = false
      // TODO: Send verification email for new email address
    }

    // Update artist profile
    Object.assign(artist, updateArtistProfileDto)
    return this.artistRepository.save(artist)
  }

  async requestVerification(id: string): Promise<{ message: string }> {
    const artist = await this.findOne(id)

    if (artist.verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException(`Verification status is already ${artist.verificationStatus}`)
    }

    // In a real application, you would implement logic to review the verification request
    // For now, we'll just update the status to PENDING
    artist.verificationStatus = VerificationStatus.PENDING
    await this.artistRepository.save(artist)

    return { message: "Verification request submitted successfully" }
  }

  async updateVerificationStatus(id: string, status: VerificationStatus): Promise<Artist> {
    const artist = await this.findOne(id)
    artist.verificationStatus = status
    return this.artistRepository.save(artist)
  }

  async deactivateAccount(id: string): Promise<{ message: string }> {
    const artist = await this.findOne(id)
    artist.isActive = false
    await this.artistRepository.save(artist)
    return { message: "Account deactivated successfully" }
  }
}
