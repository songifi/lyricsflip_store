import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estate, EstateStatus } from '../entities/estate.entity';
import { EstateRights } from '../entities/estate-rights.entity';
import { EstateInheritance } from '../entities/estate-inheritance.entity';
import { CreateEstateDto } from '../dto/create-estate.dto';
import { UpdateEstateDto } from '../dto/update-estate.dto';

@Injectable()
export class EstateService {
  constructor(
    @InjectRepository(Estate)
    private estateRepository: Repository<Estate>,
    @InjectRepository(EstateRights)
    private rightsRepository: Repository<EstateRights>,
    @InjectRepository(EstateInheritance)
    private inheritanceRepository: Repository<EstateInheritance>,
  ) {}

  async create(createEstateDto: CreateEstateDto): Promise<Estate> {
    const estate = this.estateRepository.create(createEstateDto);
    return await this.estateRepository.save(estate);
  }

  async findAll(): Promise<Estate[]> {
    return await this.estateRepository.find({
      relations: ['artist', 'primaryContact', 'rights', 'inheritances'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Estate> {
    const estate = await this.estateRepository.findOne({
      where: { id },
      relations: [
        'artist',
        'primaryContact',
        'rights',
        'inheritances',
        'inheritances.inheritee',
      ],
    });

    if (!estate) {
      throw new NotFoundException(`Estate with ID ${id} not found`);
    }

    return estate;
  }

  async findByArtist(artistId: string): Promise<Estate> {
    const estate = await this.estateRepository.findOne({
      where: { artistId },
      relations: [
        'artist',
        'primaryContact',
        'rights',
        'inheritances',
        'inheritances.inheritee',
      ],
    });

    if (!estate) {
      throw new NotFoundException(`Estate for artist ${artistId} not found`);
    }

    return estate;
  }

  async update(id: string, updateEstateDto: UpdateEstateDto): Promise<Estate> {
    const estate = await this.findOne(id);
    Object.assign(estate, updateEstateDto);
    return await this.estateRepository.save(estate);
  }

  async remove(id: string): Promise<void> {
    const estate = await this.findOne(id);
    await this.estateRepository.remove(estate);
  }

  async addRights(estateId: string, rightsData: Partial<EstateRights>): Promise<EstateRights> {
    const estate = await this.findOne(estateId);
    
    const rights = this.rightsRepository.create({
      ...rightsData,
      estateId: estate.id,
    });

    return await this.rightsRepository.save(rights);
  }

  async addInheritance(estateId: string, inheritanceData: Partial<EstateInheritance>): Promise<EstateInheritance> {
    const estate = await this.findOne(estateId);
    
    const inheritance = this.inheritanceRepository.create({
      ...inheritanceData,
      estateId: estate.id,
    });

    return await this.inheritanceRepository.save(inheritance);
  }

  async getRightsBreakdown(estateId: string) {
    const rights = await this.rightsRepository.find({
      where: { estateId },
      order: { rightsType: 'ASC' },
    });

    const breakdown = rights.reduce((acc, right) => {
      if (!acc[right.rightsType]) {
        acc[right.rightsType] = [];
      }
      acc[right.rightsType].push(right);
      return acc;
    }, {});

    return breakdown;
  }

  async getInheritanceBreakdown(estateId: string) {
    const inheritances = await this.inheritanceRepository.find({
      where: { estateId },
      relations: ['inheritee'],
      order: { inheritancePercentage: 'DESC' },
    });

    const totalPercentage = inheritances.reduce(
      (sum, inheritance) => sum + (inheritance.inheritancePercentage || 0),
      0
    );

    return {
      inheritances,
      totalPercentage,
      isComplete: totalPercentage === 100,
    };
  }

  async getEstateValuation(estateId: string) {
    const estate = await this.findOne(estateId);
    
    // Calculate estimated value based on revenue streams
    const revenueStreams = estate.financialInformation?.revenueStreams || [];
    const estimatedAnnualRevenue = revenueStreams.reduce(
      (sum, stream) => sum + stream.estimatedAnnualRevenue,
      0
    );

    // Simple valuation using revenue multiple (industry standard varies)
    const revenueMultiple = 10; // This would be configurable based on industry standards
    const estimatedValue = estimatedAnnualRevenue * revenueMultiple;

    return {
      estimatedValue,
      estimatedAnnualRevenue,
      revenueStreams,
      lastValuation: estate.financialInformation?.lastValuation,
      currency: estate.financialInformation?.currency || 'USD',
    };
  }
}