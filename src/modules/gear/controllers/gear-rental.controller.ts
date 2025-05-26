import { Controller, Get, Post, Body, Patch, Param, Request, ParseUUIDPipe } from "@nestjs/common"
import type { GearRentalService } from "../services/gear-rental.service"
import type { CreateRentalDto } from "../dto/create-rental.dto"
import type { RentalStatus } from "../entities/gear-rental.entity"
// Import your auth guard
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller("gear/rentals")
export class GearRentalController {
  constructor(private readonly gearRentalService: GearRentalService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  createRental(@Body() createRentalDto: CreateRentalDto, @Request() req: any) {
    return this.gearRentalService.createRental(createRentalDto, req.user.id)
  }

  @Get('my-rentals')
  // @UseGuards(JwtAuthGuard)
  findMyRentals(@Request() req: any) {
    return this.gearRentalService.findUserRentals(req.user.id);
  }

  @Get('gear/:gearId')
  findGearRentals(@Param('gearId', ParseUUIDPipe) gearId: string) {
    return this.gearRentalService.findGearRentals(gearId);
  }

  @Patch(":id/status")
  // @UseGuards(JwtAuthGuard)
  updateRentalStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: RentalStatus,
    @Request() req: any,
  ) {
    return this.gearRentalService.updateRentalStatus(id, status, req.user.id)
  }
}
