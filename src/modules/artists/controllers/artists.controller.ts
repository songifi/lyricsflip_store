import { Controller, Get, Param, Put, Body, Post, Delete, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ArtistsService } from "../providers/artists.service";
import { Artist } from "../entities/artist.entity";
import { GetCurrentArtist } from "src/common/decorators/get-current-artist.decorator";
import { UpdateArtistProfileDto } from "../dto/update-artist-profile.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { VerificationStatus } from "../enums/verificationStatus.enum";

@Controller("artists")
@UseGuards(JwtAuthGuard)
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  async findAll(): Promise<Artist[]> {
    return this.artistsService.findAll()
  }

  @Get('profile')
  async getProfile(@Param('artistId') artistId: string): Promise<Artist> {
    return this.artistsService.findOne(artistId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Artist> {
    return this.artistsService.findOne(id);
  }

  @Put("profile")
  async updateProfile(
    @GetCurrentArtist('sub') artistId: string,
    @Body() updateArtistProfileDto: UpdateArtistProfileDto,
  ): Promise<Artist> {
    return this.artistsService.updateProfile(artistId, updateArtistProfileDto)
  }

  @Post('request-verification')
  async requestVerification(@GetCurrentArtist('sub') artistId: string): Promise<{ message: string }> {
    return this.artistsService.requestVerification(artistId);
  }

  @Put(":id/verification-status")
  @UseGuards(RolesGuard)
  @Roles("admin")
  async updateVerificationStatus(@Param('id') id: string, @Body('status') status: VerificationStatus): Promise<Artist> {
    return this.artistsService.updateVerificationStatus(id, status)
  }

  @Delete('deactivate')
  async deactivateAccount(@GetCurrentArtist('sub') artistId: string): Promise<{ message: string }> {
    return this.artistsService.deactivateAccount(artistId);
  }
}
