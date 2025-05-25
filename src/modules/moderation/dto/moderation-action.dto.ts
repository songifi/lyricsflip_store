import { IsEnum, IsString, IsOptional, IsUUID } from "class-validator"
import { ActionType } from "../entities/moderation-action.entity"

export class CreateModerationActionDto {
  @IsUUID()
  moderationCaseId: string

  @IsEnum(ActionType)
  actionType: ActionType

  @IsString()
  @IsOptional()
  reason?: string

  @IsOptional()
  metadata?: Record<string, any>

  @IsUUID()
  performedByUserId: string
}
