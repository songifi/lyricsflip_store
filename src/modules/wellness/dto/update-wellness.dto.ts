import { PartialType } from '@nestjs/swagger';
import { CreateWellnessDto } from './create-wellness.dto';

export class UpdateWellnessDto extends PartialType(CreateWellnessDto) {}
