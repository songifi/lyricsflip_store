import { IsEnum, IsArray, IsOptional, IsString } from "class-validator"
import { MoodType, EnergyLevel, StressLevel } from "../../../database/entities/mood-entry.entity"

export class CreateMoodEntryDto {
  @IsEnum(MoodType)
  mood: MoodType

  @IsEnum(EnergyLevel)
  energy: EnergyLevel

  @IsEnum(StressLevel)
  stress: StressLevel

  @IsArray()
  @IsOptional()
  emotions?: string[]

  @IsString()
  @IsOptional()
  notes?: string

  @IsArray()
  @IsOptional()
  triggers?: string[]

  @IsArray()
  @IsOptional()
  activities?: string[]
}
