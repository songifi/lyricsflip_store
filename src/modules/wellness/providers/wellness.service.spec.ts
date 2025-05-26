import { Test, TestingModule } from '@nestjs/testing';
import { WellnessService } from './wellness.service';

describe('WellnessService', () => {
  let service: WellnessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WellnessService],
    }).compile();

    service = module.get<WellnessService>(WellnessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
