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
import { CopyrightRegistrationService } from '../services/copyright-registration.service';
import { CreateCopyrightRegistrationDto } from '../dto/create-copyright-registration.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RegistrationStatus } from '../entities/copyright-registration.entity';

@Controller('copyright-registrations')
@UseGuards(JwtAuthGuard)
export class CopyrightRegistrationController {
  constructor(
    private readonly copyrightRegistrationService: CopyrightRegistrationService,
  ) {}

  @Post()
  create(@Body() createRegistrationDto: CreateCopyrightRegistrationDto) {
    return this.copyrightRegistrationService.create(createRegistrationDto);
  }

  @Get()
  findAll(
    @Query('applicantId') applicantId?: string,
    @Query('status') status?: RegistrationStatus,
    @Query('registrationType') registrationType?: string,
  ) {
    return this.copyrightRegistrationService.findAll({
      applicantId,
      status,
      registrationType,
    });
  }

  @Get('stats')
  getStats(@Query('applicantId') applicantId?: string) {
    return this.copyrightRegistrationService.getRegistrationStats(applicantId);
  }

  @Get('registration-number/:registrationNumber')
  findByRegistrationNumber(@Param('registrationNumber') registrationNumber: string) {
    return this.copyrightRegistrationService.findByRegistrationNumber(registrationNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.copyrightRegistrationService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: RegistrationStatus; rejectionReason?: string },
  ) {
    return this.copyrightRegistrationService.updateStatus(
      id,
      body.status,
      body.rejectionReason,
    );
  }

  @Patch(':id/submit')
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { submissionReference?: string },
  ) {
    return this.copyrightRegistrationService.submit(id, body.submissionReference);
  }
}