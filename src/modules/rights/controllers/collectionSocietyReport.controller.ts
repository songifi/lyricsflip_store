import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CollectionSocietyReportService } from '../services/collection-society-report.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportStatus } from '../entities/collection-society-report.entity';

@Controller('collection-society-reports')
@UseGuards(JwtAuthGuard)
export class CollectionSocietyReportController {
  constructor(
    private readonly collectionSocietyReportService: CollectionSocietyReportService,
  ) {}

  @Post()
  create(@Body() createReportDto: any) {
    return this.collectionSocietyReportService.create(createReportDto);
  }

  @Post('generate')
  generateReport(@Body() body: {
    reportType: string;
    society: string;
    reportingPeriodStart: string;
    reportingPeriodEnd: string;
    submittedById: string;
  }) {
    return this.collectionSocietyReportService.generateReport(
      body.reportType,
      body.society,
      new Date(body.reportingPeriodStart),
      new Date(body.reportingPeriodEnd),
      body.submittedById,
    );
  }

  @Get()
  findAll(
    @Query('submittedById') submittedById?: string,
    @Query('reportType') reportType?: string,
    @Query('society') society?: string,
    @Query('status') status?: ReportStatus,
    @Query('reportingPeriod') reportingPeriod?: string,
  ) {
    return this.collectionSocietyReportService.findAll({
      submittedById,
      reportType,
      society,
      status,
      reportingPeriod,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionSocietyReportService.findOne(id);
  }

  @Patch(':id/submit')
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { submissionReference?: string },
  ) {
    return this.collectionSocietyReportService.submit(id, body.submissionReference);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: ReportStatus; rejectionReason?: string },
  ) {
    return this.collectionSocietyReportService.updateStatus(
      id,
      body.status,
      body.rejectionReason,
    );
  }
}