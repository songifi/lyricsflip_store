import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, DataSource } from "typeorm"
import { Project, type ProjectStatus } from "../entities/project.entity"
import { type ProjectMember, MemberRole, MemberStatus } from "../entities/project-member.entity"
import { TimelineEventType } from "../entities/timeline.entity"
import type { CreateProjectDto } from "../dto/create-project.dto"
import type { TimelineService } from "./timeline.service"

@Injectable()
export class ProjectService {
  constructor(
    private projectRepository: Repository<Project>,
    private memberRepository: Repository<ProjectMember>,
    private dataSource: DataSource,
    private timelineService: TimelineService,
    @InjectRepository(Project)
  ) {}

  async createProject(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Create project
      const project = this.projectRepository.create({
        ...createProjectDto,
        ownerId: userId,
        deadline: createProjectDto.deadline ? new Date(createProjectDto.deadline) : null,
      })

      const savedProject = await queryRunner.manager.save(project)

      // Add owner as admin member
      const ownerMember = this.memberRepository.create({
        projectId: savedProject.id,
        userId,
        role: MemberRole.OWNER,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
        permissions: {
          canEditProject: true,
          canInviteMembers: true,
          canManageTasks: true,
          canUploadAudio: true,
          canDownloadAudio: true,
          canLeaveComments: true,
        },
      })

      await queryRunner.manager.save(ownerMember)

      // Create timeline event
      await this.timelineService.createEvent(
        savedProject.id,
        userId,
        TimelineEventType.PROJECT_CREATED,
        "Project created",
        `Project "${savedProject.title}" was created`,
        { projectId: savedProject.id },
        queryRunner.manager,
      )

      await queryRunner.commitTransaction()
      return savedProject
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findUserProjects(userId: string): Promise<Project[]> {
    return this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.members", "member")
      .leftJoinAndSelect("member.user", "user")
      .leftJoinAndSelect("project.owner", "owner")
      .where("member.userId = :userId AND member.status = :status", {
        userId,
        status: MemberStatus.ACTIVE,
      })
      .orderBy("project.updatedAt", "DESC")
      .getMany()
  }

  async findProjectById(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.members", "member")
      .leftJoinAndSelect("member.user", "user")
      .leftJoinAndSelect("project.owner", "owner")
      .leftJoinAndSelect("project.tasks", "task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("project.audioVersions", "version")
      .leftJoinAndSelect("version.uploadedBy", "uploader")
      .where("project.id = :projectId", { projectId })
      .getOne()

    if (!project) {
      throw new NotFoundException("Project not found")
    }

    // Check if user has access
    const member = project.members.find((m) => m.userId === userId)
    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException("Access denied")
    }

    return project
  }

  async inviteMember(
    projectId: string,
    inviterId: string,
    inviteeEmail: string,
    role: MemberRole,
  ): Promise<ProjectMember> {
    const project = await this.findProjectById(projectId, inviterId)

    // Check if inviter has permission
    const inviter = project.members.find((m) => m.userId === inviterId)
    if (!inviter?.permissions?.canInviteMembers) {
      throw new ForbiddenException("You do not have permission to invite members")
    }

    // Check if project allows invites
    if (!project.settings?.allowInvites) {
      throw new BadRequestException("This project does not allow invites")
    }

    // TODO: Get user by email (implement user lookup)
    // For now, assuming userId is passed instead of email
    const inviteeId = inviteeEmail // This should be replaced with actual user lookup

    // Check if already a member
    const existingMember = project.members.find((m) => m.userId === inviteeId)
    if (existingMember) {
      throw new BadRequestException("User is already a member of this project")
    }

    const member = this.memberRepository.create({
      projectId,
      userId: inviteeId,
      role,
      status: project.settings?.requireApproval ? MemberStatus.PENDING : MemberStatus.ACTIVE,
      permissions: this.getDefaultPermissions(role),
    })

    const savedMember = await this.memberRepository.save(member)

    // Create timeline event
    await this.timelineService.createEvent(
      projectId,
      inviterId,
      TimelineEventType.MEMBER_ADDED,
      "Member invited",
      `User was invited to the project as ${role}`,
      { memberId: savedMember.id, role },
    )

    return savedMember
  }

  async updateProjectStatus(projectId: string, userId: string, status: ProjectStatus): Promise<Project> {
    const project = await this.findProjectById(projectId, userId)

    const member = project.members.find((m) => m.userId === userId)
    if (!member?.permissions?.canEditProject) {
      throw new ForbiddenException("You do not have permission to edit this project")
    }

    const oldStatus = project.status
    project.status = status
    const updatedProject = await this.projectRepository.save(project)

    // Create timeline event
    await this.timelineService.createEvent(
      projectId,
      userId,
      TimelineEventType.STATUS_CHANGED,
      "Project status updated",
      `Project status changed from ${oldStatus} to ${status}`,
      { oldStatus, newStatus: status },
    )

    return updatedProject
  }

  private getDefaultPermissions(role: MemberRole) {
    switch (role) {
      case MemberRole.OWNER:
      case MemberRole.ADMIN:
        return {
          canEditProject: true,
          canInviteMembers: true,
          canManageTasks: true,
          canUploadAudio: true,
          canDownloadAudio: true,
          canLeaveComments: true,
        }
      case MemberRole.PRODUCER:
      case MemberRole.ENGINEER:
        return {
          canEditProject: false,
          canInviteMembers: false,
          canManageTasks: true,
          canUploadAudio: true,
          canDownloadAudio: true,
          canLeaveComments: true,
        }
      case MemberRole.ARTIST:
      case MemberRole.SONGWRITER:
        return {
          canEditProject: false,
          canInviteMembers: false,
          canManageTasks: false,
          canUploadAudio: true,
          canDownloadAudio: true,
          canLeaveComments: true,
        }
      default:
        return {
          canEditProject: false,
          canInviteMembers: false,
          canManageTasks: false,
          canUploadAudio: false,
          canDownloadAudio: true,
          canLeaveComments: true,
        }
    }
  }
}
