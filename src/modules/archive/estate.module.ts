import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstateService } from './services/estate.service';
import { EstateController } from './controllers/estate.controller';
import { Estate } from './entities/estate.entity';
import { EstateRights } from './entities/estate-rights.entity';
import { EstateInheritance } from './entities/estate-inheritance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Estate,
      EstateRights,
      EstateInheritance,
    ]),
  ],
  controllers: [EstateController],
  providers: [EstateService],
  exports: [EstateService],
})
export class EstateModule {}