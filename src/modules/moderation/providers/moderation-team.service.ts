import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ModerationTeamMember, ModerationRole } from "../entities/moderation-team-member.entity"

@Injectable()
export class ModerationTeamService {
  private readonly logger = new Logger(ModerationTeamService.name)

  constructor(private teamMemberRepository: Repository<ModerationTeamMember>) {}

  @InjectRepository(ModerationTeamMember)
  async addTeamMember(userId: string, role: ModerationRole, permissions: string[] = []): Promise<ModerationTeamMember> {
    const existingMember = await this.teamMemberRepository.findOne({
      where: { userId },
    })

    if (existingMember) {
      throw new Error("User is already a moderation team member")
    }

    const teamMember = this.teamMemberRepository.create({
      userId,
      role,
      permissions,
    })

    return this.teamMemberRepository.save(teamMember)
  }

  async updateTeamMember(
    userId: string,
    updates: Partial<Pick<ModerationTeamMember, "role" | "permissions" | "isActive">>,
  ): Promise<ModerationTeamMember> {
    const teamMember = await this.teamMemberRepository.findOne({
      where: { userId },
    })

    if (!teamMember) {
      throw new Error("Team member not found")
    }

    Object.assign(teamMember, updates)
    return this.teamMemberRepository.save(teamMember)
  }

  async removeTeamMember(userId: string): Promise<void> {
    await this.teamMemberRepository.update({ userId }, { isActive: false })
  }

  async getTeamMembers(): Promise<ModerationTeamMember[]> {
    return this.teamMemberRepository.find({
      where: { isActive: true },
      relations: ["user"],
      order: { createdAt: "ASC" },
    })
  }

  async getTeamMember(userId: string): Promise<ModerationTeamMember | null> {
    return this.teamMemberRepository.findOne({
      where: { userId, isActive: true },
      relations: ["user"],
    })
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const teamMember = await this.getTeamMember(userId)

    if (!teamMember) {
      return false
    }

    // Super admins have all permissions
    if (teamMember.role === ModerationRole.SUPER_ADMIN) {
      return true
    }

    // Check specific permissions
    return teamMember.permissions.includes(permission)
  }

  async canModerate(userId: string): Promise<boolean> {
    const teamMember = await this.getTeamMember(userId)
    return !!teamMember
  }
}
