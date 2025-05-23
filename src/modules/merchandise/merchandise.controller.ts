import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MerchandiseService } from './merchandise.service';
import { CreateMerchandiseDto } from './dto/create-merchandise.dto';
import { UpdateMerchandiseDto } from './dto/update-merchandise.dto';

@Controller('merchandise')
export class MerchandiseController {
  constructor(private readonly merchandiseService: MerchandiseService) {}

  @Post()
  create(@Body() createMerchandiseDto: CreateMerchandiseDto) {
    return this.merchandiseService.create(createMerchandiseDto);
  }

  @Get()
  findAll() {
    return this.merchandiseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchandiseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMerchandiseDto: UpdateMerchandiseDto) {
    return this.merchandiseService.update(+id, updateMerchandiseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchandiseService.remove(+id);
  }
}
