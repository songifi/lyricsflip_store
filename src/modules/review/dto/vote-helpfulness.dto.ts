import { IsBoolean } from 'class-validator';

export class VoteHelpfulnessDto {
  @IsBoolean()
  isHelpful: boolean;
}
