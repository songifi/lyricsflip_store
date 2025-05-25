import { IsString, IsOptional, IsUUID } from "class-validator"

export class SubmitEntryDto {
  @IsUUID()
  trackId: string

  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  metadata?: Record<string, any>
}
