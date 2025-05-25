import { PartialType } from '@nestjs/swagger';
import { CreateAnalyticsDashboardDto } from './create-analytics-dashboard.dto';

export class UpdateAnalyticsDashboardDto extends PartialType(CreateAnalyticsDashboardDto) {}
