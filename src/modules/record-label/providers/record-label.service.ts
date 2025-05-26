import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from '../entities/label.entity';
import { CreateLabelDto } from '../dto/create-label.dto';
import { UpdateLabelDto } from '../dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
  ) {}

  async create(createLabelDto: CreateLabelDto, ownerId: string): Promise<Label> {
    const slug = this.generateSlug(createLabelDto.name);
    
    // Check if slug already exists
    const existingLabel = await this.labelRepository.findOne({ where: { slug } });
    if (existingLabel) {
      throw new BadRequestException('Label name already exists');
    }

    const label = this.labelRepository.create({
      ...createLabelDto,
      slug,
      ownerId,
    });

    return this.labelRepository.save(label);
  }

  async findAll(ownerId?: string): Promise<Label[]> {
    const query = this.labelRepository.createQueryBuilder('label')
      .leftJoinAndSelect('label.owner', 'owner')
      .leftJoinAndSelect('label.artists', 'artists');

    if (ownerId) {
      query.where('label.ownerId = :ownerId', { ownerId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Label> {
    const label = await this.labelRepository.findOne({
      where: { id },
      relations: ['owner', 'artists', 'contracts', 'releaseCampaigns', 'branding'],
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label;
  }

  async findBySlug(slug: string): Promise<Label> {
    const label = await this.labelRepository.findOne({
      where: { slug },
      relations: ['owner', 'artists', 'contracts', 'releaseCampaigns'],
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label;
  }

  async update(id: string, updateLabelDto: UpdateLabelDto): Promise<Label> {
    const label = await this.findOne(id);
    
    if (updateLabelDto.name && updateLabelDto.name !== label.name) {
      const slug = this.generateSlug(updateLabelDto.name);
      const existingLabel = await this.labelRepository.findOne({ where: { slug } });
      if (existingLabel && existingLabel.id !== id) {
        throw new BadRequestException('Label name already exists');
      }
      updateLabelDto.slug = slug;
    }

    Object.assign(label, updateLabelDto);
    return this.labelRepository.save(label);
  }

  async remove(id: string): Promise<void> {
    const label = await this.findOne(id);
    await this.labelRepository.remove(label);
  }

  async getLabelRoster(labelId: string): Promise<any[]> {
    const label = await this.labelRepository.findOne({
      where: { id: labelId },
      relations: ['artists', 'contracts'],
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label.artists.map(artist => ({
      ...artist,
      contract: label.contracts.find(c => c.artistId === artist.id && c.status === 'active'),
    }));
  }

  async getLabelAnalytics(labelId: string): Promise<any> {
    const label = await this.labelRepository.findOne({
      where: { id: labelId },
      relations: ['artists', 'contracts', 'releaseCampaigns'],
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    // Calculate analytics
    const totalArtists = label.artists.length;
    const activeContracts = label.contracts.filter(c => c.status === 'active').length;
    const activeCampaigns = label.releaseCampaigns.filter(c => c.status === 'active').length;
    const totalBudget = label.releaseCampaigns.reduce((sum, campaign) => sum + Number(campaign.budget), 0);
    const totalSpent = label.releaseCampaigns.reduce((sum, campaign) => sum + Number(campaign.spentAmount), 0);

    return {
      totalArtists,
      activeContracts,
      activeCampaigns,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      recentActivity: {
        newArtists: label.artists.filter(a => 
          new Date(a.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        newCampaigns: label.releaseCampaigns.filter(c => 
          new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
      },
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}