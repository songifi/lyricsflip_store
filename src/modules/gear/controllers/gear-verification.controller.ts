import { Controller, Get, Post, Patch, Param, Request, ParseUUIDPipe, Body } from "@nestjs/common"
import type { GearVerificationService, CreateVerificationDto } from "../services/gear-verification.service"
import type { VerificationStatus } from "../entities/gear-verification.entity"
// Import your auth guard
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller("gear/verifications")
export class GearVerificationController {
  constructor(private readonly gearVerificationService: GearVerificationService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  requestVerification(@Body() createVerificationDto: CreateVerificationDto, @Request() req: any) {
    return this.gearVerificationService.requestVerification(createVerificationDto, req.user.id)
  }

  @Get('gear/:gearId')
  findGearVerifications(@Param('gearId', ParseUUIDPipe) gearId: string) {
    return this.gearVerificationService.findGearVerifications(gearId);
  }

  @Get("pending")
  // @UseGuards(JwtAuthGuard) // Add admin role guard
  findPendingVerifications() {
    return this.gearVerificationService.findPendingVerifications()
  }

  @Patch(":id")
  // @UseGuards(JwtAuthGuard) // Add admin role guard
  processVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: {
      status: VerificationStatus;
      notes?: string;
      verificationData?: Record<string, any>;
    },
    @Request() req: any,
  ) {
    return this.gearVerificationService.processVerification(
      id,
      body.status,
      req.user.id,
      body.notes,
      body.verificationData,
    )
  }
}
