import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsNumber, IsUUID, Min } from "class-validator"
import { TaskType, TaskPriority } from "../entities/task.entity"

export class CreateTaskDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(TaskType)
  type: TaskType

  @IsEnum(TaskPriority)
  priority: TaskPriority

  @IsOptional()
  @IsUUID()
  assigneeId?: string

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedHours?: number

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  dependencies?: string[]
}
