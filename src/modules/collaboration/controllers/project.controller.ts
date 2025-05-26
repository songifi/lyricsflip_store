import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import type { ProjectService } from "../services/project.service"
import type { CreateProjectDto } from "../dto/create-project.dto"
import type { Project, ProjectStatus } from "../entities/project.entity"
import type { MemberRole } from "../entities/project-member.entity"

@ApiTags("collaboration/projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("collaboration/projects")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: "Create a new collaboration project" })
  @ApiResponse({ status: 201, description: "Project created successfully" })
  async createProject(@Body() createProjectDto: CreateProjectDto, @Request() req): Promise<Project> {
    return this.projectService.createProject(req.user.id, createProjectDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get user projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async getUserProjects(@Request() req): Promise<Project[]> {
    return this.projectService.findUserProjects(req.user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  @ApiResponse({ status: 200, description: "Project retrieved successfully" })
  async getProject(@Param('id') projectId: string, @Request() req): Promise<Project> {
    return this.projectService.findProjectById(projectId, req.user.id)
  }

  @Post(":id/invite")
  @ApiOperation({ summary: "Invite member to project" })
  @ApiResponse({ status: 201, description: "Member invited successfully" })
  async inviteMember(
    @Param('id') projectId: string,
    @Body() body: { email: string; role: MemberRole },
    @Request() req,
  ) {
    return this.projectService.inviteMember(projectId, req.user.id, body.email, body.role)
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update project status" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  async updateStatus(
    @Param('id') projectId: string,
    @Body() body: { status: ProjectStatus },
    @Request() req,
  ): Promise<Project> {
    return this.projectService.updateProjectStatus(projectId, req.user.id, body.status)
  }
}
