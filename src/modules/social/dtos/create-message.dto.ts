import { IsUUID, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  receiverId: string;

  @IsString()
  content: string;
}