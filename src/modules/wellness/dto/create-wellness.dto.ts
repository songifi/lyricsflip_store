import { IsString, IsEnum, IsInt, IsArray, IsOptional, IsUUID, Min, Max } from "class-validator"
import { ProgramType, ProgramDifficulty } from "../../../database/entities/wellness-program.entity"

export class CreateWellnessProgramDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsEnum(ProgramType)
  type: ProgramType

  @IsEnum(ProgramDifficulty)
  difficulty: ProgramDifficulty

  @IsInt()
  @Min(1)
  @Max(180)
  durationMinutes: number

  @IsInt()
  @Min(1)
  @Max(100)
  totalSessions: number

  @IsArray()
  @IsOptional()
  tags?: string[]

  @IsString()
  @IsOptional()
  instructions?: string

  @IsArray()
  @IsOptional()
  benefits?: string[]

  @IsUUID()
  categoryId: string
}
