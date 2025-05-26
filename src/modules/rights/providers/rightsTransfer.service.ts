import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RightsTransfer, TransferStatus } from '../entities/rights-transfer.entity';
import { CreateRightsTransferDto } from '../dto/create-rights-transfer.dto';
import { RightsService } from './rights.service';
import { Rights } from '../entities/rights.entity';

@Injectable()
export class RightsTransferService {
  constructor(
    @InjectRepository(RightsTransfer)
    private transferRepository: Repository<RightsTransfer>,
    private rightsService: RightsService,
    private dataSource: DataSource,
  ) {}

  async create(createTransferDto: CreateRightsTransferDto): Promise<RightsTransfer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate the transfer
      await this.validateTransfer(createTransferDto);

      const transfer = this.transferRepository.create({
        ...createTransferDto,
        transferDate: new Date(createTransferDto.transferDate),
        effectiveDate: createTransferDto.effectiveDate ? new Date(createTransferDto.effectiveDate) : undefined,
        expirationDate: createTransferDto.expirationDate ? new Date(createTransferDto.expirationDate) : undefined,
      });

      const savedTransfer = await queryRunner.manager.save(transfer);

      // If transfer is executed immediately, update the rights
      if (savedTransfer.status === TransferStatus.EXECUTED) {
        await this.executeTransfer(savedTransfer.id, queryRunner);
      }

      await queryRunner.commitTransaction();
      return savedTransfer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    rightsId?: string;
    transferorId?: string;
    transfereeId?: string;
    status?: TransferStatus;
  }): Promise<RightsTransfer[]> {
    const query = this.transferRepository.createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.rights', 'rights')
      .leftJoinAndSelect('transfer.transferor', 'transferor')
      .leftJoinAndSelect('transfer.transferee', 'transferee');

    if (filters?.rightsId) {
      query.andWhere('transfer.rightsId = :rightsId', { rightsId: filters.rightsId });
    }

    if (filters?.transferorId) {
      query.andWhere('transfer.transferorId = :transferorId', { transferorId: filters.transferorId });
    }

    if (filters?.transfereeId) {
      query.andWhere('transfer.transfereeId = :transfereeId', { transfereeId: filters.transfereeId });
    }

    if (filters?.status) {
      query.andWhere('transfer.status = :status', { status: filters.status });
    }

    return query.orderBy('transfer.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<RightsTransfer> {
    const transfer = await this.transferRepository.findOne({
      where: { id },
      relations: ['rights', 'transferor', 'transferee'],
    });

    if (!transfer) {
      throw new NotFoundException(`Rights transfer with ID ${id} not found`);
    }

    return transfer;
  }

  async execute(id: string): Promise<RightsTransfer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transfer = await this.findOne(id);

      if (transfer.status !== TransferStatus.PENDING) {
        throw new BadRequestException('Only pending transfers can be executed');
      }

      const result = await this.executeTransfer(id, queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string): Promise<RightsTransfer> {
    const transfer = await this.findOne(id);

    if (transfer.status === TransferStatus.EXECUTED) {
      throw new BadRequestException('Executed transfers cannot be cancelled');
    }

    transfer.status = TransferStatus.CANCELLED;
    return this.transferRepository.save(transfer);
  }

  private async validateTransfer(createTransferDto: CreateRightsTransferDto): Promise<void> {
    const rights = await this.rightsService.findOne(createTransferDto.rightsId);

    // Check if transferor owns the rights
    if (rights.ownerId !== createTransferDto.transferorId) {
      throw new BadRequestException('Transferor does not own the specified rights');
    }

    // Check if transfer percentage is valid
    if (createTransferDto.transferPercentage > Number(rights.ownershipPercentage)) {
      throw new BadRequestException('Transfer percentage exceeds available ownership');
    }

    // Check if transferor and transferee are different
    if (createTransferDto.transferorId === createTransferDto.transfereeId) {
      throw new BadRequestException('Transferor and transferee cannot be the same');
    }
  }

  private async executeTransfer(transferId: string, queryRunner: any): Promise<RightsTransfer> {
    const transfer = await queryRunner.manager.findOne(RightsTransfer, {
      where: { id: transferId },
      relations: ['rights'],
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${transferId} not found`);
    }

    // Update the original rights
    await this.rightsService.transferRights(
      transfer.rightsId,
      transfer.transferPercentage,
      queryRunner,
    );

    // Create new rights for the transferee
    const newRights = queryRunner.manager.create(Rights, {
      rightsType: transfer.rights.rightsType,
      ownershipType: transfer.rights.ownershipType,
      ownershipPercentage: transfer.transferPercentage,
      ownerId: transfer.transfereeId,
      trackId: transfer.rights.trackId,
      albumId: transfer.rights.albumId,
      effectiveDate: transfer.effectiveDate || new Date(),
      expirationDate: transfer.expirationDate,
      territory: transfer.rights.territory,
      restrictions: transfer.rights.restrictions,
    });

    await queryRunner.manager.save(newRights);

    // Update transfer status
    transfer.status = TransferStatus.EXECUTED;
    return queryRunner.manager.save(transfer);
  }
}