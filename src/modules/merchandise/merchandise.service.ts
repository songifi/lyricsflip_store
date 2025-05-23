import { Injectable } from '@nestjs/common';
import { CreateMerchandiseDto } from './dto/create-merchandise.dto';
import { UpdateMerchandiseDto } from './dto/update-merchandise.dto';

@Injectable()
export class MerchandiseService {
  create(createMerchandiseDto: CreateMerchandiseDto) {
    return 'This action adds a new merchandise';
  }

  findAll() {
    return `This action returns all merchandise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} merchandise`;
  }

  update(id: number, updateMerchandiseDto: UpdateMerchandiseDto) {
    return `This action updates a #${id} merchandise`;
  }

  remove(id: number) {
    return `This action removes a #${id} merchandise`;
  }
}
