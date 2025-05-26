import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleaseCampaign } from '../entities/release-campaign.entity';
import { CampaignTask } from '../entities/campaign-task.entity';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { CreateTaskDto } from '../dto/create-task.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(ReleaseCampaign)
    private campaignRepository: Repository<ReleaseCampaign>,
    @InjectRepository(CampaignTask)
    private taskRepository: Repository<CampaignTask>,
  ) {}

  async create(labelId: string, createCampaignDto: CreateCampaignDto): Promise<ReleaseCampaign> {
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      labelId,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);
    
    // Create default tasks for the campaign
    await this.createDefaultTasks(savedCampaign.id);
    
    return savedCampaign;
  }

  async findAll(labelId: string): Promise<ReleaseCampaign[]> {
    return this.campaignRepository.find({
      where: { labelId },
      relations: ['artist', 'album', 'tasks'],
      order: { releaseDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ReleaseCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['label', 'artist', 'album', 'tasks'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async updateStatus(id: string, status: string): Promise<ReleaseCampaign> {
    const campaign = await this.findOne(id);
    campaign.status = status;
    return this.campaignRepository.save(campaign);
  }

  async updateBudget(id: string, spentAmount: number): Promise<ReleaseCampaign> {
    const campaign = await this.findOne(id);
    campaign.spentAmount = Number(campaign.spentAmount) + spentAmount;
    return this.campaignRepository.save(campaign);
  }

  async createTask(campaignId: string, createTaskDto: CreateTaskDto): Promise<CampaignTask> {
    const campaign = await this.findOne(campaignId);
    
    const task = this.taskRepository.create({
      ...createTaskDto,
      campaignId,
    });

    return this.taskRepository.save(task);
  }

  async updateTask(taskId: string, updateData: Partial<CampaignTask>): Promise<CampaignTask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    Object.assign(task, updateData);
    
    if (updateData.status === 'completed' && !task.completedDate) {
      task.completedDate = new Date();
    }

    return this.taskRepository.save(task);
  }

  async getCampaignAnalytics(campaignId: string): Promise<any> {
    const campaign = await this.findOne(campaignId);
    
    const totalTasks = campaign.tasks.length;
    const completedTasks = campaign.tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = campaign.tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;
    
    const estimatedCost = campaign.tasks.reduce((sum, task) => 
      sum + (Number(task.estimatedCost) || 0), 0
    );
    const actualCost = campaign.tasks.reduce((sum, task) => 
      sum + (Number(task.actualCost) || 0), 0
    );

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const budgetUtilization = (Number(campaign.spentAmount) / Number(campaign.budget)) * 100;

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        releaseDate: campaign.releaseDate,
        artist: campaign.artist.name,
      },
      progress: {
        totalTasks,
        completedTasks,
        overdueTasks,
        progressPercentage: progress,
      },
      budget: {
        allocated: campaign.budget,
        spent: campaign.spentAmount,
        remaining: Number(campaign.budget) - Number(campaign.spentAmount),
        utilizationPercentage: budgetUtilization,
      },
      costs: {
        estimated: estimatedCost,
        actual: actualCost,
        variance: actualCost - estimatedCost,
      },
      timeline: {
        daysUntilRelease: Math.ceil(
          (new Date(campaign.releaseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        isOnTrack: progress >= 80 || overdueTasks === 0,
      },
    };
  }

  private async createDefaultTasks(campaignId: string): Promise<void> {
    const defaultTasks = [
      {
        title: 'Finalize artwork and assets',
        description: 'Complete all visual assets for the release',
        priority: 'high',
        metadata: { category: 'creative', tags: ['artwork', 'design'] },
      },
      {
        title: 'Submit to streaming platforms',
        description: 'Upload and schedule release on all streaming services',
        priority: 'high',
        metadata: { category: 'distribution', tags: ['streaming', 'upload'] },
      },
      {
        title: 'Press kit preparation',
        description: 'Create comprehensive press materials',
        priority: 'medium',
        metadata: { category: 'marketing', tags: ['press', 'media'] },
      },
      {
        title: 'Social media campaign',
        description: 'Plan and execute social media promotion',
        priority: 'medium',
        metadata: { category: 'marketing', tags: ['social', 'promotion'] },
      },
      {
        title: 'Playlist pitching',
        description: 'Submit to relevant playlists and curators',
        priority: 'high',
        metadata: { category: 'promotion', tags: ['playlists', 'curators'] },
      },
    ];

    for (const taskData of defaultTasks) {
      const task = this.taskRepository.create({
        ...taskData,
        campaignId,
      });
      await this.taskRepository.save(task);
    }
  }
}