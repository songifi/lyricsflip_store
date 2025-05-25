import { IsUUID, IsString } from 'class-validator';

export class CreateExclusiveContentDto {
  @IsUUID()
  fanClubId: string;

  @IsString()
  title: string;

  @IsString()
  contentUrl: string;
}
