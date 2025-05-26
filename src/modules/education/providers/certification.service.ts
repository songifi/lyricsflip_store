import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import {
  type InstructorCertification,
  CertificationStatus,
  type CertificationType,
} from "../entities/instructor-certification.entity"
import { type CourseCertificate, CertificateStatus } from "../entities/course-certificate.entity"
import { StudentProgress, ProgressStatus } from "../entities/student-progress.entity"

@Injectable()
export class CertificationService {
  constructor(
    private instructorCertificationRepository: Repository<InstructorCertification>,
    private courseCertificateRepository: Repository<CourseCertificate>,
    @InjectRepository(StudentProgress)
    private progressRepository: Repository<StudentProgress>,
  ) {}

  async applyForInstructorCertification(
    instructorId: string,
    certificationData: {
      type: CertificationType
      specialization: string
      qualifications: any[]
      experience: any[]
      skills: any[]
      documentUrls: string[]
    },
  ): Promise<InstructorCertification> {
    const certificationNumber = this.generateCertificationNumber()
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 2) // 2 years validity

    const certification = this.instructorCertificationRepository.create({
      instructorId,
      ...certificationData,
      certificationNumber,
      issuedDate: new Date(),
      expiryDate,
      status: CertificationStatus.PENDING,
    })

    return await this.instructorCertificationRepository.save(certification)
  }

  async reviewInstructorCertification(
    certificationId: string,
    reviewerId: string,
    decision: "approve" | "reject",
    notes?: string,
  ): Promise<InstructorCertification> {
    const certification = await this.instructorCertificationRepository.findOne({
      where: { id: certificationId },
    })

    if (!certification) {
      throw new NotFoundException("Certification not found")
    }

    if (certification.status !== CertificationStatus.PENDING) {
      throw new BadRequestException("Certification is not pending review")
    }

    certification.status = decision === "approve" ? CertificationStatus.APPROVED : CertificationStatus.REJECTED
    certification.issuedBy = reviewerId
    certification.notes = notes

    if (decision === "reject") {
      certification.rejectionReason = notes
    }

    return await this.instructorCertificationRepository.save(certification)
  }

  async generateCourseCertificate(studentId: string, courseId: string): Promise<CourseCertificate> {
    const progress = await this.progressRepository.findOne({
      where: { studentId, courseId },
      relations: ["course", "student"],
    })

    if (!progress) {
      throw new NotFoundException("Student progress not found")
    }

    if (progress.status !== ProgressStatus.COMPLETED) {
      throw new BadRequestException("Course must be completed to generate certificate")
    }

    // Check if certificate already exists
    const existingCertificate = await this.courseCertificateRepository.findOne({
      where: { studentId, courseId },
    })

    if (existingCertificate) {
      return existingCertificate
    }

    const certificateNumber = this.generateCertificateNumber()
    const totalTimeSpentHours = Math.round((progress.totalTimeSpentMinutes / 60) * 100) / 100

    // Generate achievements based on performance
    const achievements = this.generateAchievements(progress)

    // Generate skills based on course content
    const skills = this.generateSkills(progress.course)

    const certificate = this.courseCertificateRepository.create({
      studentId,
      courseId,
      certificateNumber,
      issuedDate: new Date(),
      finalScore: progress.averageScore,
      completionPercentage: progress.completionPercentage,
      totalTimeSpentHours,
      achievements,
      skills,
      metadata: {
        courseVersion: "1.0",
        instructorName: progress.course.instructor.name,
        courseDuration: progress.course.estimatedDurationMinutes,
        completionDate: progress.completedAt,
      },
      status: CertificateStatus.ISSUED,
    })

    const savedCertificate = await this.courseCertificateRepository.save(certificate)

    // Generate certificate URL (this would typically involve a PDF generation service)
    savedCertificate.certificateUrl = await this.generateCertificateUrl(savedCertificate)
    savedCertificate.verificationUrl = `${process.env.APP_URL}/verify-certificate/${savedCertificate.certificateNumber}`

    return await this.courseCertificateRepository.save(savedCertificate)
  }

  async verifyCertificate(certificateNumber: string): Promise<CourseCertificate | null> {
    const certificate = await this.courseCertificateRepository.findOne({
      where: { certificateNumber, status: CertificateStatus.ISSUED },
      relations: ["student", "course"],
    })

    if (certificate) {
      // Increment view count for analytics
      certificate.downloadCount += 1
      await this.courseCertificateRepository.save(certificate)
    }

    return certificate
  }

  async getInstructorCertifications(instructorId: string): Promise<InstructorCertification[]> {
    return await this.instructorCertificationRepository.find({
      where: { instructorId },
      order: { createdAt: "DESC" },
    })
  }

  async getStudentCertificates(studentId: string): Promise<CourseCertificate[]> {
    return await this.courseCertificateRepository.find({
      where: { studentId },
      relations: ["course"],
      order: { issuedDate: "DESC" },
    })
  }

  async renewInstructorCertification(certificationId: string): Promise<InstructorCertification> {
    const certification = await this.instructorCertificationRepository.findOne({
      where: { id: certificationId },
    })

    if (!certification) {
      throw new NotFoundException("Certification not found")
    }

    if (certification.status !== CertificationStatus.APPROVED) {
      throw new BadRequestException("Only approved certifications can be renewed")
    }

    // Check if renewal is needed (within 30 days of expiry)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    if (certification.expiryDate > thirtyDaysFromNow) {
      throw new BadRequestException("Certification is not yet eligible for renewal")
    }

    // Extend expiry date by 2 years
    certification.expiryDate = new Date()
    certification.expiryDate.setFullYear(certification.expiryDate.getFullYear() + 2)
    certification.renewalCount += 1
    certification.status = CertificationStatus.APPROVED

    return await this.instructorCertificationRepository.save(certification)
  }

  private generateCertificationNumber(): string {
    const prefix = "INST"
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  private generateCertificateNumber(): string {
    const prefix = "CERT"
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  private generateAchievements(progress: StudentProgress): any[] {
    const achievements = []

    if (progress.averageScore >= 90) {
      achievements.push({
        type: "excellence",
        title: "Excellence Award",
        description: "Achieved 90% or higher average score",
        earnedDate: progress.completedAt,
      })
    }

    if (progress.streakData?.longestStreak >= 7) {
      achievements.push({
        type: "consistency",
        title: "Consistent Learner",
        description: "Maintained a 7-day learning streak",
        earnedDate: progress.completedAt,
      })
    }

    if (progress.totalTimeSpentMinutes >= progress.course.estimatedDurationMinutes * 1.5) {
      achievements.push({
        type: "dedication",
        title: "Dedicated Student",
        description: "Spent extra time mastering the material",
        earnedDate: progress.completedAt,
      })
    }

    return achievements
  }

  private generateSkills(course: any): any[] {
    const skills = []

    // Generate skills based on course tags and learning objectives
    if (course.tags) {
      course.tags.forEach((tag) => {
        skills.push({
          skill: tag,
          level: "intermediate",
          verified: true,
        })
      })
    }

    return skills
  }

  private async generateCertificateUrl(certificate: CourseCertificate): Promise<string> {
    // This would typically involve calling a PDF generation service
    // For now, return a placeholder URL
    return `${process.env.APP_URL}/certificates/${certificate.id}.pdf`
  }
}
