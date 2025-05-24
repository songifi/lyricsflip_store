import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Band, BandStatus } from '../../database/entities/band.entity';
import { BandMember, MemberStatus, MemberPermission } from '../../database/entities/band-member.entity';
import { BandRole } from '../../database/entities/band-role.entity';
import { CreateBandDto } from './dto/create-band.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateBandDto } from './dto/update-band.dto';

@Injectable()
export class BandsService {
  constructor(
    @InjectRepository(Band)
    private bandRepository: Repository<Band>,
    @InjectRepository(BandMember)
    private bandMemberRepository: Repository<BandMember>,
    @InjectRepository(BandRole)
    private bandRoleRepository: Repository<BandRole>,
  ) {}

  async createBand(createBandDto: CreateBandDto, founderId: string): Promise<Band> {
    // Check if user already has a band with the same name
    const existingBand = await this.bandRepository.findOne({
      where: { name: createBandDto.name, founderId },
    });

    if (existingBand) {
      throw new BadRequestException('You already have a band with this name');
    }

    const band = this.bandRepository.create({
      ...createBandDto,
      founderId,
      formedDate: createBandDto.formedDate ? new Date(createBandDto.formedDate) : null,
    });

    const savedBand = await this.bandRepository.save(band);

    // Add founder as admin member
    const founderMember = this.bandMemberRepository.create({
      bandId: savedBand.id,
      userId: founderId,
      permission: MemberPermission.ADMIN,
      status: MemberStatus.ACTIVE,
      joinedDate: new Date(),
    });

    await this.bandMemberRepository.save(founderMember);

    return this.findOne(savedBand.id);
  }

  async findAll(userId?: string): Promise<Band[]> {
    const query = this.bandRepository
      .createQueryBuilder('band')
      .leftJoinAndSelect('band.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('members.roles', 'roles')
      .leftJoinAndSelect('band.founder', 'founder');

    if (userId) {
      query.where('members.userId = :userId AND members.status = :status', {
        userId,
        status: MemberStatus.ACTIVE,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Band> {
    const band = await this.bandRepository
      .createQueryBuilder('band')
      .leftJoinAndSelect('band.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('members.roles', 'roles')
      .leftJoinAndSelect('band.founder', 'founder')
      .leftJoinAndSelect('band.albums', 'albums')
      .where('band.id = :id', { id })
      .getOne();

    if (!band) {
      throw new NotFoundException('Band not found');
    }

    return band;
  }

  async updateBand(id: string, updateBandDto: UpdateBandDto, userId: string): Promise<Band> {
    const band = await this.findOne(id);
    
    // Check if user has permission to update
    const member = band.members.find(m => m.userId === userId && m.status === MemberStatus.ACTIVE);
    if (!member || (member.permission !== MemberPermission.ADMIN && member.permission !== MemberPermission.MANAGER)) {
      throw new ForbiddenException('You do not have permission to update this band');
    }

    await this.bandRepository.update(id, {
      ...updateBandDto,
      formedDate: updateBandDto.formedDate ? new Date(updateBandDto.formedDate) : undefined,
    });

    return this.findOne(id);
  }

  async addMember(bandId: string, addMemberDto: AddMemberDto, requesterId: string): Promise<BandMember> {
    const band = await this.findOne(bandId);
    
    // Check if requester has permission
    const requesterMember = band.members.find(m => m.userId === requesterId && m.status === MemberStatus.ACTIVE);
    if (!requesterMember || (requesterMember.permission !== MemberPermission.ADMIN && requesterMember.permission !== MemberPermission.MANAGER)) {
      throw new ForbiddenException('You do not have permission to add members');
    }

    // Check if user is already a member
    const existingMember = band.members.find(m => m.userId === addMemberDto.userId);
    if (existingMember && existingMember.status === MemberStatus.ACTIVE) {
      throw new BadRequestException('User is already a member of this band');
    }

    const member = this.bandMemberRepository.create({
      bandId,
      userId: addMemberDto.userId,
      permission: addMemberDto.permission || MemberPermission.MEMBER,
      status: MemberStatus.ACTIVE,
      joinedDate: new Date(),
      notes: addMemberDto.notes,
    });

    const savedMember = await this.bandMemberRepository.save(member);

    // Add roles if provided
    if (addMemberDto.roles && addMemberDto.roles.length > 0) {
      const roles = addMemberDto.roles.map((roleDto, index) => 
        this.bandRoleRepository.create({
          memberId: savedMember.id,
          instrument: roleDto.instrument,
          customRole: roleDto.customRole,
          description: roleDto.description,
          isPrimary: index === 0, // First role is primary
        })
      );

      await this.bandRoleRepository.save(roles);
    }

    return this.bandMemberRepository.findOne({
      where: { id: savedMember.id },
      relations: ['user', 'roles'],
    });
  }

  async removeMember(bandId: string, memberId: string, requesterId: string): Promise<void> {
    const band = await this.findOne(bandId);
    
    // Check if requester has permission
    const requesterMember = band.members.find(m => m.userId === requesterId && m.status === MemberStatus.ACTIVE);
    if (!requesterMember || requesterMember.permission !== MemberPermission.ADMIN) {
      throw new ForbiddenException('Only admins can remove members');
    }

    const memberToRemove = band.members.find(m => m.id === memberId);
    if (!memberToRemove) {
      throw new NotFoundException('Member not found');
    }

    // Cannot remove founder
    if (memberToRemove.userId === band.founderId) {
      throw new BadRequestException('Cannot remove band founder');
    }

    await this.bandMemberRepository.update(memberId, {
      status: MemberStatus.REMOVED,
      leftDate: new Date(),
    });
  }

  async updateMemberPermission(
    bandId: string,
    memberId: string,
    permission: MemberPermission,
    requesterId: string,
  ): Promise<BandMember> {
    const band = await this.findOne(bandId);
    
    // Check if requester has permission
    const requesterMember = band.members.find(m => m.userId === requesterId && m.status === MemberStatus.ACTIVE);
    if (!requesterMember || requesterMember.permission !== MemberPermission.ADMIN) {
      throw new ForbiddenException('Only admins can update member permissions');
    }

    const memberToUpdate = band.members.find(m => m.id === memberId);
    if (!memberToUpdate) {
      throw new NotFoundException('Member not found');
    }

    // Cannot change founder permission
    if (memberToUpdate.userId === band.founderId) {
      throw new BadRequestException('Cannot change founder permission');
    }

    await this.bandMemberRepository.update(memberId, { permission });

    return this.bandMemberRepository.findOne({
      where: { id: memberId },
      relations: ['user', 'roles'],
    });
  }

  async disbandBand(bandId: string, requesterId: string): Promise<void> {
    const band = await this.findOne(bandId);
    
    // Only founder can disband
    if (band.founderId !== requesterId) {
      throw new ForbiddenException('Only the founder can disband the band');
    }

    await this.bandRepository.update(bandId, {
      status: BandStatus.DISBANDED,
    });

    // Update all active members to inactive
    await this.bandMemberRepository.update(
      { bandId, status: MemberStatus.ACTIVE },
      { status: MemberStatus.INACTIVE, leftDate: new Date() },
    );
  }

  async getBandMembers(bandId: string): Promise<BandMember[]> {
    return this.bandMemberRepository.find({
      where: { bandId, status: MemberStatus.ACTIVE },
      relations: ['user', 'roles'],
      order: { joinedDate: 'ASC' },
    });
  }

  async checkMemberPermission(bandId: string, userId: string): Promise<MemberPermission | null> {
    const member = await this.bandMemberRepository.findOne({
      where: { bandId, userId, status: MemberStatus.ACTIVE },
    });

    return member?.permission || null;
  }
}