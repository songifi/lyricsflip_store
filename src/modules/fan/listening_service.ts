import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface CreateListeningSessionDto {
  userId: string;
  trackId: string;
  albumId?: string;
  playlistId?: string;
  artistId?: string;
}