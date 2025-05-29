import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publishing } from '../entities/publishing.entity';

@Injectable()
export class PublishingService {
  constructor(
    @InjectRepository(Publishing)
    private publishingRepo: Repository<Publishing>,
  ) {}

  async create(data: Partial<Publishing>) {
    const pub = this.publishingRepo.create(data);
    return this.publishingRepo.save(pub);
  }

  async findAll() {
    return this.publishingRepo.find({ relations: ['songwriters'] });
  }
}
