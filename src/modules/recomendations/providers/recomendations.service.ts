import { Injectable } from '@nestjs/common';
import { CreateRecomendationDto } from './dto/create-recomendation.dto';
import { UpdateRecomendationDto } from './dto/update-recomendation.dto';

@Injectable()
export class RecomendationsService {
  create(createRecomendationDto: CreateRecomendationDto) {
    return 'This action adds a new recomendation';
  }

  findAll() {
    return `This action returns all recomendations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recomendation`;
  }

  update(id: number, updateRecomendationDto: UpdateRecomendationDto) {
    return `This action updates a #${id} recomendation`;
  }

  remove(id: number) {
    return `This action removes a #${id} recomendation`;
  }
}
