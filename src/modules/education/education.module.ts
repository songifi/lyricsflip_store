import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CourseController } from "./controllers/course.controller"
import { LessonController } from "./controllers/lesson.controller"
import { ProgressController } from "./controllers/progress.controller"
import { CertificationController } from "./controllers/certification.controller"
import { AssignmentController } from "./controllers/assignment.controller"
import { AnalyticsController } from "./controllers/analytics.controller"
import { CourseService } from "./services/course.service"
import { LessonService } from "./services/lesson.service"
import { ProgressService } from "./services/progress.service"
import { CertificationService } from "./services/certification.service"
import { AssignmentService } from "./services/assignment.service"
import { AnalyticsService } from "./services/analytics.service"
import { VideoService } from "./services/video.service"
import { Course } from "./entities/course.entity"
import { Lesson } from "./entities/lesson.entity"
import { Exercise } from "./entities/exercise.entity"
import { Assignment } from "./entities/assignment.entity"
import { StudentProgress } from "./entities/student-progress.entity"
import { InstructorCertification } from "./entities/instructor-certification.entity"
import { CourseCertificate } from "./entities/course-certificate.entity"
import { VideoTutorial } from "./entities/video-tutorial.entity"
import { LessonCompletion } from "./entities/lesson-completion.entity"
import { AssignmentSubmission } from "./entities/assignment-submission.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Lesson,
      Exercise,
      Assignment,
      StudentProgress,
      InstructorCertification,
      CourseCertificate,
      VideoTutorial,
      LessonCompletion,
      AssignmentSubmission,
    ]),
  ],
  controllers: [
    CourseController,
    LessonController,
    ProgressController,
    CertificationController,
    AssignmentController,
    AnalyticsController,
  ],
  providers: [
    CourseService,
    LessonService,
    ProgressService,
    CertificationService,
    AssignmentService,
    AnalyticsService,
    VideoService,
  ],
  exports: [
    CourseService,
    LessonService,
    ProgressService,
    CertificationService,
    AssignmentService,
    AnalyticsService,
    VideoService,
  ],
})
export class EducationModule {}
