import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Task, TaskStatus } from "../entities/task.entity"
import { ProjectMember, MemberStatus } from "../entities/project-member.entity"
import type { CreateTaskDto } from "../dto/create-task.dto"
import type { TimelineService } from "./timeline.service"
import { TimelineEventType } from "../entities/timeline.entity"

@Injectable()
export class TaskService {
  private taskRepository: Repository<Task>
  private memberRepository: Repository<ProjectMember>
  private timelineService: TimelineService

  constructor(
    @InjectRepository(Task)
    taskRepository: Repository<Task>,
    @InjectRepository(ProjectMember)
    memberRepository: Repository<ProjectMember>,
    timelineService: TimelineService,
  ) {
    this.taskRepository = taskRepository
    this.memberRepository = memberRepository
    this.timelineService = timelineService
  }

  async createTask(projectId: string, userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    // Check if user has permission
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
    })

    if (!member?.permissions?.canManageTasks) {
      throw new ForbiddenException("You do not have permission to create tasks")
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      projectId,
      createdById: userId,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      dependencies: createTaskDto.dependencies || [],
    })

    const savedTask = await this.taskRepository.save(task)

    // Create timeline event
    await this.timelineService.createEvent(
      projectId,
      userId,
      TimelineEventType.TASK_CREATED,
      "Task created",
      `Task "${createTaskDto.title}" was created`,
      { taskId: savedTask.id },
    )

    return savedTask
  }

  async getProjectTasks(projectId: string, userId: string): Promise<Task[]> {
    // Check if user has access
    const member = await this.memberRepository.findOne({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
    })

    if (!member) {
      throw new ForbiddenException("Access denied")
    }

    return this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("task.createdBy", "createdBy")
      .where("task.projectId = :projectId", { projectId })
      .orderBy("task.createdAt", "DESC")
      .getMany()
  }

  async updateTaskStatus(taskId: string, userId: string, status: TaskStatus): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["project"],
    })

    if (!task) {
      throw new NotFoundException("Task not found")
    }

    // Check if user has permission (assignee or task manager)
    const member = await this.memberRepository.findOne({
      where: {
        projectId: task.projectId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    })

    const canUpdate = member?.permissions?.canManageTasks || task.assigneeId === userId
    if (!canUpdate) {
      throw new ForbiddenException("You do not have permission to update this task")
    }

    const oldStatus = task.status
    task.status = status

    if (status === TaskStatus.IN_PROGRESS && !task.startedAt) {
      task.startedAt = new Date()
    }

    if (status === TaskStatus.COMPLETED && !task.completedAt) {
      task.completedAt = new Date()
    }

    const updatedTask = await this.taskRepository.save(task)

    // Create timeline event for completion
    if (status === TaskStatus.COMPLETED) {
      await this.timelineService.createEvent(
        task.projectId,
        userId,
        TimelineEventType.TASK_COMPLETED,
        "Task completed",
        `Task "${task.title}" was completed`,
        { taskId: task.id },
      )
    }

    return updatedTask
  }

  async assignTask(taskId: string, userId: string, assigneeId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    })

    if (!task) {
      throw new NotFoundException("Task not found")
    }

    // Check if user has permission
    const member = await this.memberRepository.findOne({
      where: {
        projectId: task.projectId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    })

    if (!member?.permissions?.canManageTasks) {
      throw new ForbiddenException("You do not have permission to assign tasks")
    }

    // Check if assignee is a project member
    const assigneeMember = await this.memberRepository.findOne({
      where: {
        projectId: task.projectId,
        userId: assigneeId,
        status: MemberStatus.ACTIVE,
      },
    })

    if (!assigneeMember) {
      throw new ForbiddenException("Assignee is not a member of this project")
    }

    task.assigneeId = assigneeId
    return this.taskRepository.save(task)
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("task.createdBy", "createdBy")
      .where("task.assigneeId = :userId", { userId })
      .andWhere("task.status NOT IN (:...completedStatuses)", {
        completedStatuses: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
      })
      .orderBy("task.dueDate", "ASC")
      .getMany()
  }
}
