import { IsString, IsOptional, IsUUID } from "class-validator"

export class CreateAppealDto {
  @IsUUID()
  moderationCaseId: string

  @IsString()
  reason: string

  @IsString()
  @IsOptional()
  evidence?: string

  @IsUUID()
  submittedByUserId: string
}
