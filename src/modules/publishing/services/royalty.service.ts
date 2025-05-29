import { Injectable } from '@nestjs/common';
import { calculateMechanicalRoyalty } from '../utils/royalty-calculator';

@Injectable()
export class RoyaltyService {
  calculate(revenue: number, split: number) {
    return calculateMechanicalRoyalty(revenue, split);
  }
}
