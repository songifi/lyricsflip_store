import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Configure connection pool for music streaming workloads
    if (this.dataSource.isInitialized) {
      const poolSize = this.configService.get<number>('database.poolSize', 10);
      const maxConnections = this.configService.get<number>('database.maxConnections', 100);
      
      console.log(`Database connection initialized with pool size: ${poolSize}, max connections: ${maxConnections}`);
    }
  }

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}