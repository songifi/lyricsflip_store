import { Controller, Post, Body } from '@nestjs/common';
import { CreateCatalogDto } from '../dto/create-catalog.dto';
import { CatalogService } from '../services/catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  create(@Body() dto: CreateCatalogDto) {
    return this.catalogService.create(dto);
  }
}
