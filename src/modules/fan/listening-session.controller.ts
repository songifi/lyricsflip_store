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
  HttpStatus,
  HttpException,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ListeningSessionService } from '../services/listening-session.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreateListeningSessionDto,
  UpdateListeningSessionDto,
  ListeningSessionQueryDto,
  ListeningSessionStatsDto,
  BulkUpdateListeningSessionDto,
  ListeningSessionResponseDto,
  PaginatedListeningSessionsDto,
} from '../dto/listening-session.dto';

@ApiTags('Listening Sessions')
@Controller('listening-sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class ListeningSessionController {
  constructor(private readonly listeningSessionService: ListeningSessionService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new listening session',
    description: 'Start tracking a new listening session for the authenticated user'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Listening session created successfully',
    type: ListeningSessionResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createDto: CreateListeningSessionDto,
    @Request() req: any,
  ): Promise<ListeningSessionResponseDto> {
    try {
      const session = await this.listeningSessionService.create({
        ...createDto,
        userId: req.user.id,
      });
      return this.transformToResponseDto(session);
    } catch (error) {
      throw new HttpException(
        'Failed to create listening session',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get user listening sessions',
    description: 'Retrieve paginated listening sessions for the authenticated user with optional filtering'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Listening sessions retrieved successfully',
    type: PaginatedListeningSessionsDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: ListeningSessionQueryDto,
    @Request() req: any,
  ): Promise<PaginatedListeningSessionsDto> {
    const { data, total } = await this.listeningSessionService.findByUser(
      req.user.id,
      query,
    );

    const transformedData = data.map(session => this.transformToResponseDto(session));
    const totalPages = Math.ceil(total / query.limit);

    return {
      data: transformedData,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get listening statistics',
    description: 'Get aggregated listening statistics for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(
    @Query() query: ListeningSessionStatsDto,
    @Request() req: any,
  ) {
    return await this.listeningSessionService.getStats(req.user.id, query);
  }

  @Get('recent')
  @ApiOperation({ 
    summary: 'Get recent listening sessions',
    description: 'Get the most recent listening sessions for the authenticated user'
  })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of recent sessions to return (max 50)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent sessions retrieved successfully',
    type: [ListeningSessionResponseDto]
  })
  async getRecent(
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ): Promise<ListeningSessionResponseDto[]> {
    // Ensure limit doesn't exceed 50
    const safeLimit = Math.min(limit, 50);
    
    const sessions = await this.listeningSessionService.getRecent(
      req.user.id,
      safeLimit,
    );
    
    return sessions.map(session => this.transformToResponseDto(session));
  }

  @Get('currently-playing')
  @ApiOperation({ 
    summary: 'Get currently playing session',
    description: 'Get the current active listening session if any'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Current session retrieved successfully',
    type: ListeningSessionResponseDto
  })
  @ApiResponse({ status: 404, description: 'No active session found' })
  async getCurrentlyPlaying(@Request() req: any): Promise<ListeningSessionResponseDto> {
    const session = await this.listeningSessionService.getCurrentlyPlaying(req.user.id);
    
    if (!session) {
      throw new HttpException('No active session found', HttpStatus.NOT_FOUND);
    }
    
    return this.transformToResponseDto(session);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get listening session by ID',
    description: 'Retrieve a specific listening session by its ID'
  })
  @ApiParam({ name: 'id', description: 'Listening Session UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Listening session retrieved successfully',
    type: ListeningSessionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Listening session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<ListeningSessionResponseDto> {
    const session = await this.listeningSessionService.findOne(id, req.user.id);
    
    if (!session) {
      throw new HttpException('Listening session not found', HttpStatus.NOT_FOUND);
    }
    
    return this.transformToResponseDto(session);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update listening session',
    description: 'Update a specific listening session (typically to update playback progress)'
  })
  @ApiParam({ name: 'id', description: 'Listening Session UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Listening session updated successfully',
    type: ListeningSessionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Listening session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateListeningSessionDto,
    @Request() req: any,
  ): Promise<ListeningSessionResponseDto> {
    try {
      const session = await this.listeningSessionService.update(
        id,
        req.user.id,
        updateDto,
      );
      
      if (!session) {
        throw new HttpException('Listening session not found', HttpStatus.NOT_FOUND);
      }
      
      return this.transformToResponseDto(session);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update listening session',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('bulk-update')
  @ApiOperation({ 
    summary: 'Bulk update listening sessions',
    description: 'Update multiple listening sessions at once'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sessions updated successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid bulk update data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdateListeningSessionDto,
    @Request() req: any,
  ) {
    try {
      const result = await this.listeningSessionService.bulkUpdate(
        bulkUpdateDto.sessionIds,
        req.user.id,
        bulkUpdateDto.updates,
      );
      
      return {
        message: 'Sessions updated successfully',
        updatedCount: result.affected || 0,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update sessions',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete listening session',
    description: 'Delete a specific listening session'
  })
  @ApiParam({ name: 'id', description: 'Listening Session UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Listening session deleted successfully'
  })
  @ApiResponse({ status: 404, description: 'Listening session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const result = await this.listeningSessionService.remove(id, req.user.id);
    
    if (!result.affected) {
      throw new HttpException('Listening session not found', HttpStatus.NOT_FOUND);
    }
    
    return {
      message: 'Listening session deleted successfully',
    };
  }

  @Delete()
  @ApiOperation({ 
    summary: 'Delete all user listening sessions',
    description: 'Delete all listening sessions for the authenticated user (use with caution)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All listening sessions deleted successfully'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAll(@Request() req: any) {
    const result = await this.listeningSessionService.removeAllForUser(req.user.id);
    
    return {
      message: 'All listening sessions deleted successfully',
      deletedCount: result.affected || 0,
    };
  }

  @Post(':id/complete')
  @ApiOperation({ 
    summary: 'Mark session as completed',
    description: 'Mark a listening session as completed (usually when track finishes)'
  })
  @ApiParam({ name: 'id', description: 'Listening Session UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session marked as completed',
    type: ListeningSessionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Listening session not found' })
  async markAsCompleted(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<ListeningSessionResponseDto> {
    const session = await this.listeningSessionService.markAsCompleted(
      id,
      req.user.id,
    );
    
    if (!session) {
      throw new HttpException('Listening session not found', HttpStatus.NOT_FOUND);
    }
    
    return this.transformToResponseDto(session);
  }

  @Post(':id/skip')
  @ApiOperation({ 
    summary: 'Mark session as skipped',
    description: 'Mark a listening session as skipped'
  })
  @ApiParam({ name: 'id', description: 'Listening Session UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session marked as skipped',
    type: ListeningSessionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Listening session not found' })
  async markAsSkipped(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<ListeningSessionResponseDto> {
    const session = await this.listeningSessionService.markAsSkipped(
      id,
      req.user.id,
    );
    
    if (!session) {
      throw new HttpException('Listening session not found', HttpStatus.NOT_FOUND);
    }
    
    return this.transformToResponseDto(session);
  }

  // Helper method to transform entity to response DTO
  private transformToResponseDto(session: any): ListeningSessionResponseDto {
    return {
      id: session.id,
      userId: session.userId,
      trackId: session.trackId,
      albumId: session.albumId,
      playlistId: session.playlistId,
      artistId: session.artistId,
      trackTitle: session.trackTitle,
      artistName: session.artistName,
      albumTitle: session.albumTitle,
      genre: session.genre,
      duration: session.duration,
      playedDuration: session.playedDuration,
      isCompleted: session.isCompleted,
      isSkipped: session.isSkipped,
      sessionType: session.sessionType,
      playbackSource: session.playbackSource,
      deviceInfo: session.deviceInfo,
      location: session.location,
      ipAddress: session.ipAddress,
      isOffline: session.isOffline,
      shuffleMode: session.shuffleMode,
      repeatMode: session.repeatMode,
      volume: session.volume,
      createdAt: session.createdAt,
      completionPercentage: session.completionPercentage,
      isValidListen: session.isValidListen,
    };
  }
}