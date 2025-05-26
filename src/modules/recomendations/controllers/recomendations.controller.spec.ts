import { Test, TestingModule } from '@nestjs/testing';
import { RecomendationsController } from './recomendations.controller';
import { RecomendationsService } from './recomendations.service';

describe('RecomendationsController', () => {
  let controller: RecomendationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendationsController],
      providers: [RecomendationsService],
    }).compile();

    controller = module.get<RecomendationsController>(RecomendationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
