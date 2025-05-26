import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CopyrightRegistration, RegistrationStatus } from '../entities/copyright-registration.entity';
import { CreateCopyrightRegistrationDto } from '../dto/create-copyright-registration.dto';

@Injectable()
export class CopyrightRegistrationService {
  constructor(
    @InjectRepository(CopyrightRegistration)
    private registrationRepository: Repository<CopyrightRegistration>,
  ) {}

  async create(createRegistrationDto: CreateCopyrightRegistrationDto): Promise<CopyrightRegistration> {
    const registrationNumber = await this.generateRegistrationNumber();

    const registration = this.registrationRepository.create({
      ...createRegistrationDto,
      registrationNumber,
      creationDate: new Date(createRegistrationDto.creationDate),
      publicationDate: new Date(createRegistrationDto.publicationDate),
    });

    return this.registrationRepository.save(registration);
  }

  async findAll(filters?: {
    applicantId?: string;
    status?: RegistrationStatus;
    registrationType?: string;
  }): Promise<CopyrightRegistration[]> {
    const query = this.registrationRepository.createQueryBuilder('registration')
      .leftJoinAndSelect('registration.applicant', 'applicant')
      .leftJoinAndSelect('registration.track', 'track')
      .leftJoinAndSelect('registration.album', 'album');

    if (filters?.applicantId) {
      query.andWhere('registration.applicantId = :applicantId', { applicantId: filters.applicantId });
    }

    if (filters?.status) {
      query.andWhere('registration.status = :status', { status: filters.status });
    }

    if (filters?.registrationType) {
      query.andWhere('registration.registrationType = :registrationType', { 
        registrationType: filters.registrationType 
      });
    }

    return query.orderBy('registration.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<CopyrightRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['applicant', 'track', 'album'],
    });

    if (!registration) {
      throw new NotFoundException(`Copyright registration with ID ${id} not found`);
    }

    return registration;
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<CopyrightRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { registrationNumber },
      relations: ['applicant', 'track', 'album'],
    });

    if (!registration) {
      throw new NotFoundException(`Copyright registration with number ${registrationNumber} not found`);
    }

    return registration;
  }

  async updateStatus(
    id: string,
    status: RegistrationStatus,
    rejectionReason?: string,
  ): Promise<CopyrightRegistration> {
    const registration = await this.findOne(id);

    registration.status = status;
    if (status === RegistrationStatus.APPROVED) {
      registration.registrationDate = new Date();
    }
    if (status === RegistrationStatus.REJECTED && rejectionReason) {
      registration.rejectionReason = rejectionReason;
    }

    return this.registrationRepository.save(registration);
  }

  async submit(id: string, submissionReference?: string): Promise<CopyrightRegistration> {
    const registration = await this.findOne(id);

    registration.status = RegistrationStatus.SUBMITTED;
    registration.submissionReference = submissionReference;

    return this.registrationRepository.save(registration);
  }

  private async generateRegistrationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.registrationRepository.count({
      where: {
        registrationNumber: Like(`CR${year}%`),
      },
    });

    return `CR${year}${String(count + 1).padStart(6, '0')}`;
  }

  async getRegistrationStats(applicantId?: string): Promise<{
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
    expired: number;
  }> {
    const query = this.registrationRepository.createQueryBuilder('registration');

    if (applicantId) {
      query.where('registration.applicantId = :applicantId', { applicantId });
    }

    const [total, pending, submitted, approved, rejected, expired] = await Promise.all([
      query.getCount(),
      query.clone().andWhere('registration.status = :status', { status: RegistrationStatus.PENDING }).getCount(),
      query.clone().andWhere('registration.status = :status', { status: RegistrationStatus.SUBMITTED }).getCount(),
      query.clone().andWhere('registration.status = :status', { status: RegistrationStatus.APPROVED }).getCount(),
      query.clone().andWhere('registration.status = :status', { status: RegistrationStatus.REJECTED }).getCount(),
      query.clone().andWhere('registration.status = :status', { status: RegistrationStatus.EXPIRED }).getCount(),
    ]);

    return { total, pending, submitted, approved, rejected, expired };
  }
}