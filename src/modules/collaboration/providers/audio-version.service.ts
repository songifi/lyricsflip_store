import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, DataSource } from "typeorm"
import { AudioVersion, AudioVersionStatus } from "../entities/audio-version.entity"
import { Project } from "../entities/project.entity"
import { ProjectMember, MemberStatus } from "../entities/project-member.entity"
import { TimelineEventType } from "../entities/timeline.entity"
import type { UploadAudioDto } from "../dto/upload-audio.dto"
import type { TimelineService } from "./timeline.service"
import type { Express } from "express"

@Injectable()
export class AudioVersionService {
  private audioVersionRepository: Repository<AudioVersion>
  private projectRepository: Repository<Project>
  private memberRepository: Repository<ProjectMember>

  constructor(
    @InjectRepository(AudioVersion)
    audioVersionRepository: Repository<AudioVersion>,
    @InjectRepository(Project)
    projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    memberRepository: Repository<ProjectMember>,
    private dataSource: DataSource,
    private timelineService: TimelineService,
  ) {
    this.audioVersionRepository = audioVersionRepository
    this.projectRepository = projectRepository
    this.memberRepository = memberRepository
  }

  async uploadAudioVersion(
    projectId: string,
    userId: string,
    uploadDto: UploadAudioDto,
    file: Express.Multer.File,
  ): Promise<AudioVersion> {
    // Check if user has permission
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
    })

    if (!member?.permissions?.canUploadAudio) {
      throw new ForbiddenException("You do not have permission to upload audio")
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Get next version number
      const lastVersion = await this.audioVersionRepository
        .createQueryBuilder("version")
        .where("version.projectId = :projectId", { projectId })
        .orderBy("version.versionNumber", "DESC")
        .getOne()

      const versionNumber = (lastVersion?.versionNumber || 0) + 1

      // TODO: Upload file to cloud storage and get URL
      const fileUrl = `https://storage.example.com/${file.filename}`

      // Create audio version
      const audioVersion = this.audioVersionRepository.create({
        projectId,
        uploadedById: userId,
        versionNumber,
        title: uploadDto.title,
        description: uploadDto.description,
        type: uploadDto.type,
        status: AudioVersionStatus.DRAFT,
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        fileFormat: file.mimetype,
        parentVersionId: uploadDto.parentVersionId,
        changes: uploadDto.changes
          ? {
              ...uploadDto.changes,
              timestamp: new Date(),
            }
          : null,
        metadata: uploadDto.metadata,
        isCurrentVersion: true,
      })

      // Set previous versions as not current
      if (audioVersion.isCurrentVersion) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(AudioVersion)
          .set({ isCurrentVersion: false })
          .where("projectId = :projectId AND id != :currentId", {
            projectId,
            currentId: audioVersion.id,
          })
          .execute()
      }

      const savedVersion = await queryRunner.manager.save(audioVersion)

      // Create timeline event
      await this.timelineService.createEvent(
        projectId,
        userId,
        TimelineEventType.AUDIO_UPLOADED,
        "Audio version uploaded",
        `New audio version "${uploadDto.title}" (v${versionNumber}) uploaded`,
        { versionId: savedVersion.id, versionNumber },
        queryRunner.manager,
      )

      await queryRunner.commitTransaction()
      return savedVersion
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async getProjectVersions(projectId: string, userId: string): Promise<AudioVersion[]> {
    // Check if user has access
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
    })

    if (!member) {
      throw new ForbiddenException("Access denied")
    }

    return this.audioVersionRepository
      .createQueryBuilder("version")
      .leftJoinAndSelect("version.uploadedBy", "uploader")
      .leftJoinAndSelect("version.feedback", "feedback")
      .leftJoinAndSelect("feedback.author", "feedbackAuthor")
      .where("version.projectId = :projectId", { projectId })
      .orderBy("version.versionNumber", "DESC")
      .getMany()
  }

  async approveVersion(versionId: string, userId: string): Promise<AudioVersion> {
    const version = await this.audioVersionRepository.findOne({
      where: { id: versionId },
      relations: ["project"],
    })

    if (!version) {
      throw new NotFoundException("Audio version not found")
    }

    // Check if user has permission
    const member = await this.memberRepository.findOne({
      where: {
        projectId: version.projectId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    })

    if (!member?.permissions?.canManageTasks) {
      throw new ForbiddenException("You do not have permission to approve versions")
    }

    version.status = AudioVersionStatus.APPROVED
    const updatedVersion = await this.audioVersionRepository.save(version)

    // Create timeline event
    await this.timelineService.createEvent(
      version.projectId,
      userId,
      TimelineEventType.AUDIO_APPROVED,
      "Audio version approved",
      `Audio version "${version.title}" was approved`,
      { versionId: version.id },
    )

    return updatedVersion
  }

  async getVersionHistory(versionId: string, userId: string): Promise<AudioVersion[]> {
    const version = await this.audioVersionRepository.findOne({
      where: { id: versionId },
    })

    if (!version) {
      throw new NotFoundException("Audio version not found")
    }

    // Check if user has access
    const member = await this.memberRepository.findOne({
      where: {
        projectId: version.projectId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    })

    if (!member) {
      throw new ForbiddenException("Access denied")
    }

    // Get version history by following parent relationships
    const history: AudioVersion[] = []
    let currentVersion = version

    while (currentVersion) {
      history.push(currentVersion)
      if (currentVersion.parentVersionId) {
        currentVersion = await this.audioVersionRepository.findOne({
          where: { id: currentVersion.parentVersionId },
          relations: ["uploadedBy"],
        })
      } else {
        break
      }
    }

    return history
  }
}
