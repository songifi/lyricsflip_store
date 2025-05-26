import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ContractsService } from '../services/contracts.service';
import { CreateContractDto } from '../dto/create-contract.dto';
import { CreateRoyaltyPaymentDto } from '../dto/create-royalty-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('labels/:labelId/contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new artist contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  create(
    @Param('labelId') labelId: string,
    @Body() createContractDto: CreateContractDto,
  ) {
    return this.contractsService.create(labelId, createContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contracts for a label' })
  @ApiResponse({ status: 200, description: 'Contracts retrieved successfully' })
  findAll(@Param('labelId') labelId: string) {
    return this.contractsService.findAll(labelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update contract status' })
  @ApiResponse({ status: 200, description: 'Contract status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.contractsService.updateStatus(id, status);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get contract analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  getAnalytics(@Param('id') id: string) {
    return this.contractsService.getContractAnalytics(id);
  }

  @Post(':id/royalty-payments')
  @ApiOperation({ summary: 'Create royalty payment' })
  @ApiResponse({ status: 201, description: 'Royalty payment created successfully' })
  createRoyaltyPayment(
    @Param('id') contractId: string,
    @Body() createRoyaltyPaymentDto: CreateRoyaltyPaymentDto,
  ) {
    return this.contractsService.createRoyaltyPayment({
      ...createRoyaltyPaymentDto,
      contractId,
    });
  }

  @Get(':id/royalty-payments')
  @ApiOperation({ summary: 'Get royalty payment history' })
  @ApiResponse({ status: 200, description: 'Royalty history retrieved successfully' })
  getRoyaltyHistory(@Param('id') contractId: string) {
    return this.contractsService.getRoyaltyHistory(contractId);
  }
}