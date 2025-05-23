import { Test, TestingModule } from '@nestjs/testing';
import { MerchandiseController } from './merchandise.controller';
import { MerchandiseService } from './merchandise.service';

describe('MerchandiseController', () => {
  let controller: MerchandiseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchandiseController],
      providers: [MerchandiseService],
    }).compile();

    controller = module.get<MerchandiseController>(MerchandiseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
