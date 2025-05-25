import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaboration, CollaborationStatus } from '../../database/entities/collaboration.entity';
import { CollaborationInvite, InviteStatus } from '../../database/entities/collaboration-invite.entity';
import { BandsService } from './bands.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { MemberPermission } from '../../database/entities/band-member.entity';

@Injectable()
export class CollaborationsService {
  constructor(
    @InjectRepository(Collaboration)
    private collaborationRepository: Repository<Collaboration>,
    @InjectRepository(CollaborationInvite)
    private inviteRepository: Repository<CollaborationInvite>,
    private bandsService: BandsService,
    private notificationsService: NotificationsService,
  ) {}

  async createCollaboration(
    bandId: string,
    createCollaborationDto: CreateCollaborationDto,
    initiatorId: string,
  ): Promise<Collaboration> {
    // Check if user has permission to create collaborations
    const permission = await this.bandsService.checkMemberPermission(bandId, initiatorId);
    if (!permission || (permission !== MemberPermission.ADMIN && permission !== MemberPermission.MANAGER)) {
      throw new ForbiddenException('You do not have permission to create collaborations');
    }

    const collaboration = this.collaborationRepository.create({
      ...createCollaborationDto,
      bandId,
      initiatorId,
      startDate: createCollaborationDto.startDate ? new Date(createCollaborationDto.startDate) : null,
      endDate: createCollaborationDto.endDate ? new Date(createCollaborationDto.endDate) : null,
    });

    const savedCollaboration = await this.collaborationRepository.save(collaboration);

    // Send invites
    if (createCollaborationDto.inviteUserIds?.length > 0) {
      await this.sendUserInvites(savedCollaboration.id, createCollaborationDto.inviteUserIds, initiatorId);
    }

    if (createCollaborationDto.inviteBandIds?.length > 0) {
      await this.sendBandInvites(savedCollaboration.id, createCollaborationDto.inviteBandIds, initiatorId);
    }

    return this.findOne(savedCollaboration.id);
  }

  async findOne(id: string): Promise<Collaboration> {
    const collaboration = await this.collaborationRepository.findOne({
      where: { id },
      relations: ['band', 'initiator', 'invites', 'invites.invitedUser', 'invites.invitedBand'],
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    return collaboration;
  }

  async findByBand(bandId: string): Promise<Collaboration[]> {
    return this.collaborationRepository.find({
      where: { bandId },
      relations: ['band', 'initiator', 'invites'],
      order: { createdAt: 'DESC' },
    });
  }

  async sendUserInvites(collaborationId: string, userIds: string[], invitedById: string): Promise<void> {
    const collaboration = await this.findOne(collaborationId);
    
    const invites = userIds.map(userId => 
      this.inviteRepository.create({
        collaborationId,
        invitedUserId: userId,
        invitedById,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
    );

    await this.inviteRepository.save(invites);

    // Send notifications
    for (const userId of userIds) {
      await this.notificationsService.create({
        userId,
        type: 'collaboration_invite',
        title: 'Collaboration Invitation',
        message: `You've been invited to collaborate on "${collaboration.title}"`,
        data: { collaborationId, inviteId: invites.find(i => i.invitedUserId === userId)?.id },
      });
    }
  }

  async sendBandInvites(collaborationId: string, bandIds: string[], invitedById: string): Promise<void> {
    const collaboration = await this.findOne(collaborationId);
    
    const invites = bandIds.map(bandId => 
      this.inviteRepository.create({
        collaborationId,
        invitedBandId: bandId,
        invitedById,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
    );

    await this.inviteRepository.save(invites);

    // Send notifications to band admins
    for (const bandId of bandIds) {
      const band = await this.bandsService.findOne(bandId);
      const admins = band.members.filter(m => m.permission === MemberPermission.ADMIN);
      
      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin.userId,
          type: 'collaboration_invite',
          title: 'Band Collaboration Invitation',
          message: `Your band "${band.name}" has been invited to collaborate on "${collaboration.title}"`,
          data: { collaborationId, inviteId: invites.find(i => i.invitedBandId === bandId)?.id },
        });
      }
    }
  }

  async respondToInvite(inviteId: string, response: 'accept' | 'decline', userId: string): Promise<void> {
    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId },
      relations: ['collaboration', 'invitedUser', 'invitedBand'],
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite has already been responded to');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    // Check if user has permission to respond
    if (invite.invitedUserId && invite.invitedUserId !== userId) {
      throw new ForbiddenException('You cannot respond to this invite');
    }

    if (invite.invitedBandId) {
      const permission = await this.bandsService.checkMemberPermission(invite.invitedBandId, userId);
      if (!permission || (permission !== MemberPermission.ADMIN && permission !== MemberPermission.MANAGER)) {
        throw new ForbiddenException('You do not have permission to respond to this invite');
      }
    }

    const status = response === 'accept' ? InviteStatus.ACCEPTED : InviteStatus.DECLINED;
    
    await this.inviteRepository.update(inviteId, {
      status,
      respondedAt: new Date(),
    });

    // Notify collaboration initiator
    await this.notificationsService.create({
      userId: invite.collaboration.initiatorId,
      type: 'collaboration_response',
      title: 'Collaboration Response',
      message: `Your collaboration invite for "${invite.collaboration.title}" was ${response}ed`,
      data: { collaborationId: invite.collaborationId, response },
    });
  }

  async updateCollaborationStatus(
    collaborationId: string,
    status: CollaborationStatus,
    userId: string,
  ): Promise<Collaboration> {
    const collaboration = await this.findOne(collaborationId);
    
    // Check if user has permission
    const permission = await this.bandsService.checkMemberPermission(collaboration.bandId, userId);
    if (!permission || (permission !== MemberPermission.ADMIN && permission !== MemberPermission.MANAGER)) {
      throw new ForbiddenException('You do not have permission to update this collaboration');
    }

    await this.collaborationRepository.update(collaborationId, { status });
    return this.findOne(collaborationId);
  }

  async getUserInvites(userId: string): Promise<CollaborationInvite[]> {
    return this.inviteRepository.find({
      where: [
        { invitedUserId: userId, status: InviteStatus.PENDING },
      ],
      relations: ['collaboration', 'collaboration.band', 'invitedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBandInvites(bandId: string): Promise<CollaborationInvite[]> {
    return this.inviteRepository.find({
      where: { invitedBandId: bandId, status: InviteStatus.PENDING },
      relations: ['collaboration', 'collaboration.band', 'invitedBy'],
      order: { createdAt: 'DESC' },
    });
  }
}