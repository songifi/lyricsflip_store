import { IsString, IsEnum, IsOptional } from "class-validator"
import { CollaboratorRole } from "../../../../database/entities/playlist-collaborator.entity"

export class AddCollaboratorDto {
  @IsString()
  userId: string

  @IsOptional()
  @IsEnum(CollaboratorRole)
  role?: CollaboratorRole
}
