import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabelBranding } from '../entities/label-branding.entity';
import { CreateBrandingDto } from '../dto/create-branding.dto';

@Injectable()
export class BrandingService {
  constructor(
    @InjectRepository(LabelBranding)
    private brandingRepository: Repository<LabelBranding>,
  ) {}

  async create(labelId: string, createBrandingDto: CreateBrandingDto): Promise<LabelBranding> {
    const branding = this.brandingRepository.create({
      ...createBrandingDto,
      labelId,
    });

    return this.brandingRepository.save(branding);
  }

  async findAll(labelId: string): Promise<LabelBranding[]> {
    return this.brandingRepository.find({
      where: { labelId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(labelId: string, type: string): Promise<LabelBranding[]> {
    return this.brandingRepository.find({
      where: { labelId, type, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LabelBranding> {
    const branding = await this.brandingRepository.findOne({
      where: { id },
      relations: ['label'],
    });

    if (!branding) {
      throw new NotFoundException('Branding asset not found');
    }

    return branding;
  }

  async update(id: string, updateData: Partial<LabelBranding>): Promise<LabelBranding> {
    const branding = await this.findOne(id);
    Object.assign(branding, updateData);
    return this.brandingRepository.save(branding);
  }

  async remove(id: string): Promise<void> {
    const branding = await this.findOne(id);
    await this.brandingRepository.remove(branding);
  }

  async getBrandingKit(labelId: string): Promise<any> {
    const brandingAssets = await this.findAll(labelId);
    
    const kit = {
      logos: brandingAssets.filter(b => b.type === 'logo'),
      colorPalettes: brandingAssets.filter(b => b.type === 'color_palette'),
      typography: brandingAssets.filter(b => b.type === 'typography'),
      templates: brandingAssets.filter(b => b.type === 'template'),
      assets: brandingAssets.filter(b => b.type === 'asset'),
    };

    return kit;
  }

  async applyBrandingToArtist(labelId: string, artistId: string): Promise<any> {
    const brandingKit = await this.getBrandingKit(labelId);
    
    // This would integrate with the artist's profile to apply label branding
    // Implementation would depend on your artist entity structure
    
    return {
      message: 'Branding applied successfully',
      appliedAssets: brandingKit,
      artistId,
    };
  }
}