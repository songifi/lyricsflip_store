import { Test, TestingModule } from '@nestjs/testing';
import { WellnessController } from './wellness.controller';
import { WellnessService } from '../wellness.service';

describe('WellnessController', () => {
  let controller: WellnessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WellnessController],
      providers: [WellnessService],
    }).compile();

    controller = module.get<WellnessController>(WellnessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
