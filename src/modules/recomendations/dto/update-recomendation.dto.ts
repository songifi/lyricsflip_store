import { PartialType } from '@nestjs/swagger';
import { CreateRecomendationDto } from './create-recomendation.dto';

export class UpdateRecomendationDto extends PartialType(CreateRecomendationDto) {}
