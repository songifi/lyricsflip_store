import { Injectable } from '@nestjs/common';
import { CreateGearDto } from './dto/create-gear.dto';
import { UpdateGearDto } from './dto/update-gear.dto';

@Injectable()
export class GearService {
  create(createGearDto: CreateGearDto) {
    return 'This action adds a new gear';
  }

  findAll() {
    return `This action returns all gear`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gear`;
  }

  update(id: number, updateGearDto: UpdateGearDto) {
    return `This action updates a #${id} gear`;
  }

  remove(id: number) {
    return `This action removes a #${id} gear`;
  }
}
