import { Test, TestingModule } from '@nestjs/testing';
import { GearController } from './gear.controller';
import { GearService } from './gear.service';

describe('GearController', () => {
  let controller: GearController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GearController],
      providers: [GearService],
    }).compile();

    controller = module.get<GearController>(GearController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
