import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import {
  TherapistProfile,
  type TherapistSpecialty,
  type CertificationLevel,
} from "../../../database/entities/therapist-profile.entity"

@Injectable()
export class TherapistService {
  private therapistRepository: Repository<TherapistProfile>

  constructor(
    @InjectRepository(TherapistProfile)
    therapistRepository: Repository<TherapistProfile>,
  ) {
    this.therapistRepository = therapistRepository;
  }

  async createTherapistProfile(profileData: Partial<TherapistProfile>): Promise<TherapistProfile> {
    const profile = this.therapistRepository.create(profileData)
    return this.therapistRepository.save(profile)
  }

  async getAllTherapists(): Promise<TherapistProfile[]> {
    return this.therapistRepository.find({
      where: { isActive: true, isVerified: true },
      order: { rating: "DESC", totalReviews: "DESC" },
    })
  }

  async getTherapistsBySpecialty(specialty: TherapistSpecialty): Promise<TherapistProfile[]> {
    return this.therapistRepository
      .createQueryBuilder("therapist")
      .where("therapist.isActive = :isActive", { isActive: true })
      .andWhere("therapist.isVerified = :isVerified", { isVerified: true })
      .andWhere(":specialty = ANY(therapist.specialties)", { specialty })
      .orderBy("therapist.rating", "DESC")
      .addOrderBy("therapist.totalReviews", "DESC")
      .getMany()
  }

  async getTherapistById(id: string): Promise<TherapistProfile> {
    const therapist = await this.therapistRepository.findOne({
      where: { id, isActive: true },
    })

    if (!therapist) {
      throw new NotFoundException("Therapist not found")
    }

    return therapist
  }

  async searchTherapists(criteria: {
    specialties?: TherapistSpecialty[]
    certificationLevel?: CertificationLevel
    minRating?: number
    languages?: string[]
    minExperience?: number
  }): Promise<TherapistProfile[]> {
    const queryBuilder = this.therapistRepository
      .createQueryBuilder("therapist")
      .where("therapist.isActive = :isActive", { isActive: true })
      .andWhere("therapist.isVerified = :isVerified", { isVerified: true })

    if (criteria.specialties && criteria.specialties.length > 0) {
      queryBuilder.andWhere("therapist.specialties && :specialties", {
        specialties: criteria.specialties,
      })
    }

    if (criteria.certificationLevel) {
      queryBuilder.andWhere("therapist.certificationLevel = :certLevel", {
        certLevel: criteria.certificationLevel,
      })
    }

    if (criteria.minRating) {
      queryBuilder.andWhere("therapist.rating >= :minRating", {
        minRating: criteria.minRating,
      })
    }

    if (criteria.languages && criteria.languages.length > 0) {
      queryBuilder.andWhere("therapist.languages && :languages", {
        languages: criteria.languages,
      })
    }

    if (criteria.minExperience) {
      queryBuilder.andWhere("therapist.yearsExperience >= :minExp", {
        minExp: criteria.minExperience,
      })
    }

    return queryBuilder.orderBy("therapist.rating", "DESC").addOrderBy("therapist.totalReviews", "DESC").getMany()
  }

  async updateTherapistRating(therapistId: string, newRating: number): Promise<TherapistProfile> {
    const therapist = await this.getTherapistById(therapistId)

    const totalRatingPoints = (therapist.rating || 0) * therapist.totalReviews
    const newTotalReviews = therapist.totalReviews + 1
    const newAverageRating = (totalRatingPoints + newRating) / newTotalReviews

    therapist.rating = Math.round(newAverageRating * 100) / 100
    therapist.totalReviews = newTotalReviews

    return this.therapistRepository.save(therapist)
  }

  async verifyTherapist(therapistId: string): Promise<TherapistProfile> {
    const therapist = await this.getTherapistById(therapistId)
    therapist.isVerified = true
    return this.therapistRepository.save(therapist)
  }
}
