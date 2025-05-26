import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

// Entities
import { Project } from "./entities/project.entity"
import { ProjectMember } from "./entities/project-member.entity"
import { AudioVersion } from "./entities/audio-version.entity"
import { Task } from "./entities/task.entity"
import { Feedback } from "./entities/feedback.entity"
import { Timeline } from "./entities/timeline.entity"
import { ProjectAnalytics } from "./entities/project-analytics.entity"

// Services
import { ProjectService } from "./services/project.service"
import { AudioVersionService } from "./services/audio-version.service"
import { TaskService } from "./services/task.service"
import { FeedbackService } from "./services/feedback.service"
import { TimelineService } from "./services/timeline.service"
import { AnalyticsService } from "./services/analytics.service"

// Controllers
import { ProjectController } from "./controllers/project.controller"
import { AudioVersionController } from "./controllers/audio-version.controller"
import { TaskController, UserTaskController } from "./controllers/task.controller"
import { FeedbackController } from "./controllers/feedback.controller"

// Gateways
import { CollaborationGateway } from "./gateways/collaboration.gateway"

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, AudioVersion, Task, Feedback, Timeline, ProjectAnalytics]),
  ],
  controllers: [ProjectController, AudioVersionController, TaskController, UserTaskController, FeedbackController],
  providers: [
    ProjectService,
    AudioVersionService,
    TaskService,
    FeedbackService,
    TimelineService,
    AnalyticsService,
    CollaborationGateway,
  ],
  exports: [
    ProjectService,
    AudioVersionService,
    TaskService,
    FeedbackService,
    TimelineService,
    AnalyticsService,
    CollaborationGateway,
  ],
})
export class CollaborationModule {}
