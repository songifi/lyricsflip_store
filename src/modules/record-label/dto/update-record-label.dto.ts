import { PartialType } from '@nestjs/swagger';
import { CreateRecordLabelDto } from './create-record-label.dto';

export class UpdateRecordLabelDto extends PartialType(CreateRecordLabelDto) {}
