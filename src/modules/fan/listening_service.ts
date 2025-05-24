// src/services/listening.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListeningSession, SessionType, PlaybackSource } from '../entities/listening-session.entity';
import { UserActivity, ActivityType } from '../entities/user-activity.entity';
import { UserService } from './user.service';

export interface CreateListeningSessionDto {
  userId: string;
  trackId: string;
  albumId?: string;
  playlistId?: string;
  artistId?: string;
  