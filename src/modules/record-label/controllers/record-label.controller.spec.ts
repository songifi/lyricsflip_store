import { Test, TestingModule } from '@nestjs/testing';
import { RecordLabelController } from './record-label.controller';
import { RecordLabelService } from './record-label.service';

describe('RecordLabelController', () => {
  let controller: RecordLabelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordLabelController],
      providers: [RecordLabelService],
    }).compile();

    controller = module.get<RecordLabelController>(RecordLabelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
