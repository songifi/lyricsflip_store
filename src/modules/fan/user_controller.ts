// src/controllers/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateMusicPreferencesDto,
  AddToLibraryDto,
  FollowUserDto,
  FollowArtistDto,
  UserResponseDto,
  UserStatsResponseDto,
  YearEndWrapResponseDto,
} from '../dto/user.dto';
import { LibraryItemType } from '../entities/user-library.entity';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);
    return this.mapToUserResponse(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    const user = await this.userService.findUserById(req.user.sub);
    return this.mapToUserResponse(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(req.user.sub, updateUserDto);
    return this.mapToUserResponse(user);
  }

  @Put('music-preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update music preferences' })
  @ApiResponse({ status: 200, description: 'Music preferences updated successfully' })
  async updateMusicPreferences(
    @Request() req,
    @Body() preferences: UpdateMusicPreferencesDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateMusicPreferences(req.user.sub, preferences);
    return this.mapToUserResponse(user);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user listening statistics' })
  @ApiResponse({ status: 200, description: 'User stats retrieved successfully' })
  async getUserStats(@Request() req): Promise<UserStatsResponseDto> {
    return this.userService.getUserStats(req.user.sub);
  }

  @Get('year-end-wrap/:year')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get year-end wrap for user' })
  @ApiResponse({ status: 200, description: 'Year-end wrap generated successfully' })
  async getYearEndWrap(
    @Request() req,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<YearEndWrapResponseDto> {
    return this.userService.getYearEndWrap(req.user.sub, year);
  }

  @Post('library')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to user library' })
  @ApiResponse({ status: 201, description: 'Item added to library successfully' })
  async addToLibrary(@Request() req, @Body() addToLibraryDto: AddToLibraryDto) {
    return this.userService.addToLibrary(req.user.sub, addToLibraryDto);
  }

  @Get('library')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user library' })
  @ApiQuery({ name: 'type', enum: LibraryItemType, required: false })
  async getLibrary(
    @Request() req,
    @Query('type') itemType?: LibraryItemType,
  ) {
    return this.userService.getUserLibrary(req.user.sub, itemType);
  }

  @Delete('library/:itemId/:itemType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from library' })
  @ApiResponse({ status: 204, description: 'Item removed successfully' })
  async removeFromLibrary(
    @Request() req,
    @Param('itemId') itemId: string,
    @Param('itemType') itemType: LibraryItemType,
  ) {
    await this.userService.removeFromLibrary(req.user.sub, itemId, itemType);
  }

  @Post('follow/user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed successfully' })
  async followUser(@Request() req, @Body() followUserDto: FollowUserDto) {
    await this.userService.followUser(req.user.sub, followUserDto.userId);
    return { message: 'User followed successfully' };
  }

  @Delete('follow/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 204, description: 'User unfollowed successfully' })
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    await this.userService.unfollowUser(req.user.sub, userId);
  }

  @Post('follow/artist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Follow an artist' })
  @ApiResponse({ status: 201, description: 'Artist followed successfully' })
  async followArtist(@Request() req, @Body() followArtistDto: FollowArtistDto) {
    await this.userService.followArtist(
      req.user.sub,
      followArtistDto.artistId,
      followArtistDto.artistName,
      followArtistDto.artistAvatar,
    );
    return { message: 'Artist followed successfully' };
  }

  @Get('followers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user followers' })
  async getFollowers(@Request() req) {
    return this.userService.getFollowers(req.user.sub);
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users/artists that user follows' })
  async getFollowing(@Request() req) {
    return this.userService.getFollowing(req.user.sub);
  }

  @Get('activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user activities' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserActivities(
    @Request() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.userService.getUserActivities(req.user.sub, limit);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity feed from followed users' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(
    @Request() req,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.userService.getFeedActivities(req.user.sub, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const users = await this.userService.searchUsers(query, limit);
    return users.map(user => this.mapToUserResponse(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findUserById(id);
    return this.mapToUserResponse(user);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByUsername(@Param('username') username: string): Promise<UserResponseDto> {
    const user = await this.userService.findUserByUsername(username);
    return this.mapToUserResponse(user);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  async deleteAccount(@Request() req) {
    await this.userService.deleteUser(req.user.sub);
  }

  @Put('deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 204, description: 'Account deactivated successfully' })
  async deactivateAccount(@Request() req) {
    await this.userService.deactivateUser(req.user.sub);
  }

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      birthDate: user.birthDate,
      subscriptionTier: user.subscriptionTier,
      favoriteGenres: user.favoriteGenres,
      favoriteArtists: user.favoriteArtists,
      isPublicProfile: user.isPublicProfile,
      allowFollowers: user.allowFollowers,
      isVerified: user.isVerified,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}