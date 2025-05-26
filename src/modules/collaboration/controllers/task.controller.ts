import { Controller, Get, Post, Body, Param, Patch, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import type { TaskService } from "../services/task.service"
import type { CreateTaskDto } from "../dto/create-task.dto"
import type { Task, TaskStatus } from "../entities/task.entity"

@ApiTags("collaboration/tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("collaboration/projects/:projectId/tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  @ApiResponse({ status: 201, description: "Task created successfully" })
  async createTask(
    req: any,
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.taskService.createTask(projectId, req.user.id, createTaskDto)
  }

  @Get()
  @ApiOperation({ summary: "Get project tasks" })
  @ApiResponse({ status: 200, description: "Tasks retrieved successfully" })
  async getProjectTasks(req: any, @Param('projectId') projectId: string): Promise<Task[]> {
    return this.taskService.getProjectTasks(projectId, req.user.id)
  }

  @Patch(":taskId/status")
  @ApiOperation({ summary: "Update task status" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  async updateTaskStatus(
    req: any,
    @Param('taskId') taskId: string,
    @Body() body: { status: TaskStatus },
  ): Promise<Task> {
    return this.taskService.updateTaskStatus(taskId, req.user.id, body.status)
  }

  @Patch(":taskId/assign")
  @ApiOperation({ summary: "Assign task to user" })
  @ApiResponse({ status: 200, description: "Task assigned successfully" })
  async assignTask(req: any, @Param('taskId') taskId: string, @Body() body: { assigneeId: string }): Promise<Task> {
    return this.taskService.assignTask(taskId, req.user.id, body.assigneeId)
  }
}

@ApiTags("collaboration/tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("collaboration/tasks")
export class UserTaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get("my-tasks")
  @ApiOperation({ summary: "Get user assigned tasks" })
  @ApiResponse({ status: 200, description: "Tasks retrieved successfully" })
  async getUserTasks(req: any): Promise<Task[]> {
    return this.taskService.getUserTasks(req.user.id)
  }
}
