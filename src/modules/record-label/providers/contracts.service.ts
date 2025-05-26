import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabelContract } from '../entities/label-contract.entity';
import { RoyaltyPayment } from '../entities/royalty-payment.entity';
import { CreateContractDto } from '../dto/create-contract.dto';
import { CreateRoyaltyPaymentDto } from '../dto/create-royalty-payment.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(LabelContract)
    private contractRepository: Repository<LabelContract>,
    @InjectRepository(RoyaltyPayment)
    private royaltyPaymentRepository: Repository<RoyaltyPayment>,
  ) {}

  async create(labelId: string, createContractDto: CreateContractDto): Promise<LabelContract> {
    // Check for existing active contract with the same artist
    const existingContract = await this.contractRepository.findOne({
      where: {
        labelId,
        artistId: createContractDto.artistId,
        status: 'active',
      },
    });

    if (existingContract) {
      throw new BadRequestException('Artist already has an active contract with this label');
    }

    const contractNumber = await this.generateContractNumber(labelId);

    const contract = this.contractRepository.create({
      ...createContractDto,
      labelId,
      contractNumber,
      status: 'pending',
    });

    return this.contractRepository.save(contract);
  }

  async findAll(labelId: string): Promise<LabelContract[]> {
    return this.contractRepository.find({
      where: { labelId },
      relations: ['artist', 'royaltyPayments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LabelContract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['label', 'artist', 'royaltyPayments'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async updateStatus(id: string, status: string): Promise<LabelContract> {
    const contract = await this.findOne(id);
    contract.status = status;
    return this.contractRepository.save(contract);
  }

  async calculateRoyalties(contractId: string, grossRevenue: number): Promise<number> {
    const contract = await this.findOne(contractId);
    const royaltyAmount = grossRevenue * (contract.royaltyRate / 100);
    
    // Check if advance needs to be recouped
    const unrecoupedAmount = contract.advanceAmount - contract.recoupedAmount;
    if (unrecoupedAmount > 0) {
      const recoupAmount = Math.min(royaltyAmount, unrecoupedAmount);
      contract.recoupedAmount += recoupAmount;
      await this.contractRepository.save(contract);
      return Math.max(0, royaltyAmount - recoupAmount);
    }

    return royaltyAmount;
  }

  async createRoyaltyPayment(createRoyaltyPaymentDto: CreateRoyaltyPaymentDto): Promise<RoyaltyPayment> {
    const contract = await this.findOne(createRoyaltyPaymentDto.contractId);
    
    const royaltyAmount = await this.calculateRoyalties(
      createRoyaltyPaymentDto.contractId,
      createRoyaltyPaymentDto.grossRevenue
    );

    const payment = this.royaltyPaymentRepository.create({
      ...createRoyaltyPaymentDto,
      amount: royaltyAmount,
      royaltyRate: contract.royaltyRate,
    });

    return this.royaltyPaymentRepository.save(payment);
  }

  async getRoyaltyHistory(contractId: string): Promise<RoyaltyPayment[]> {
    return this.royaltyPaymentRepository.find({
      where: { contractId },
      order: { paymentDate: 'DESC' },
    });
  }

  async getContractAnalytics(contractId: string): Promise<any> {
    const contract = await this.findOne(contractId);
    const payments = await this.getRoyaltyHistory(contractId);

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.grossRevenue), 0);
    const isRecouped = contract.recoupedAmount >= contract.advanceAmount;

    return {
      contract: {
        id: contract.id,
        artist: contract.artist.name,
        status: contract.status,
        royaltyRate: contract.royaltyRate,
        advanceAmount: contract.advanceAmount,
        recoupedAmount: contract.recoupedAmount,
        isRecouped,
      },
      financials: {
        totalRevenue,
        totalPaid,
        averagePayment: payments.length > 0 ? totalPaid / payments.length : 0,
        paymentsCount: payments.length,
      },
      recentPayments: payments.slice(0, 5),
    };
  }

  private async generateContractNumber(labelId: string): Promise<string> {
    const count = await this.contractRepository.count({ where: { labelId } });
    const year = new Date().getFullYear();
    return `${labelId.substring(0, 8).toUpperCase()}-${year}-${(count + 1).toString().padStart(3, '0')}`;
  }
}