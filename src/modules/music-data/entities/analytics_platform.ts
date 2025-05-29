# Analytics Platform - NestJS Module

## Project Structure
```
src/
├── analytics/
│   ├── analytics.module.ts
│   ├── controllers/
│   │   ├── analytics.controller.ts
│   │   ├── trends.controller.ts
│   │   ├── market-research.controller.ts
│   │   ├── demographics.controller.ts
│   │   ├── predictive.controller.ts
│   │   ├── benchmarking.controller.ts
│   │   └── dashboard.controller.ts
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── data-warehouse.service.ts
│   │   ├── trend-analysis.service.ts
│   │   ├── market-research.service.ts
│   │   ├── demographic-analysis.service.ts
│   │   ├── predictive-analytics.service.ts
│   │   ├── benchmarking.service.ts
│   │   └── dashboard.service.ts
│   ├── entities/
│   │   ├── analytics-data.entity.ts
│   │   ├── trend.entity.ts
│   │   ├── market-segment.entity.ts
│   │   ├── demographic.entity.ts
│   │   ├── prediction.entity.ts
│   │   └── benchmark.entity.ts
│   ├── dto/
│   │   ├── analytics-query.dto.ts
│   │   ├── trend-analysis.dto.ts
│   │   ├── market-research.dto.ts
│   │   ├── demographic-analysis.dto.ts
│   │   ├── prediction.dto.ts
│   │   └── benchmark.dto.ts
│   └── interfaces/
│       └── analytics.interfaces.ts
```

## 1. Analytics Module (analytics.module.ts)
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AnalyticsController,
  TrendsController,
  MarketResearchController,
  DemographicsController,
  PredictiveController,
  BenchmarkingController,
  DashboardController,
} from './controllers';
import {
  AnalyticsService,
  DataWarehouseService,
  TrendAnalysisService,
  MarketResearchService,
  DemographicAnalysisService,
  PredictiveAnalyticsService,
  BenchmarkingService,
  DashboardService,
} from './services';
import {
  AnalyticsData,
  Trend,
  MarketSegment,
  Demographic,
  Prediction,
  Benchmark,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsData,
      Trend,
      MarketSegment,
      Demographic,
      Prediction,
      Benchmark,
    ]),
  ],
  controllers: [
    AnalyticsController,
    TrendsController,
    MarketResearchController,
    DemographicsController,
    PredictiveController,
    BenchmarkingController,
    DashboardController,
  ],
  providers: [
    AnalyticsService,
    DataWarehouseService,
    TrendAnalysisService,
    MarketResearchService,
    DemographicAnalysisService,
    PredictiveAnalyticsService,
    BenchmarkingService,
    DashboardService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
```

## 2. Entities

### analytics-data.entity.ts
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('analytics_data')
@Index(['industry', 'category', 'timestamp'])
@Index(['userId', 'timestamp'])
export class AnalyticsData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  industry: string;

  @Column()
  category: string;

  @Column('jsonb')
  data: Record<string, any>;

  @Column('decimal', { precision: 15, scale: 2 })
  value: number;

  @Column()
  source: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

### trend.entity.ts
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('trends')
export class Trend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  industry: string;

  @Column()
  category: string;

  @Column('jsonb')
  dataPoints: Array<{ date: string; value: number }>;

  @Column('decimal', { precision: 10, scale: 4 })
  growthRate: number;

  @Column('decimal', { precision: 10, scale: 4 })
  confidence: number;

  @Column()
  trendDirection: 'up' | 'down' | 'stable';

  @Column('jsonb')
  forecast: Array<{ date: string; predicted: number; confidence: number }>;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  validUntil: Date;
}
```

### market-segment.entity.ts
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('market_segments')
export class MarketSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  industry: string;

  @Column('jsonb')
  characteristics: Record<string, any>;

  @Column('decimal', { precision: 15, scale: 2 })
  marketSize: number;

  @Column('decimal', { precision: 10, scale: 4 })
  growthRate: number;

  @Column('jsonb')
  competitiveAnalysis: Record<string, any>;

  @Column('jsonb')
  opportunities: string[];

  @Column('jsonb')
  threats: string[];

  @CreateDateColumn()
  lastAnalyzed: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

### demographic.entity.ts
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('demographics')
export class Demographic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  segmentId: string;

  @Column('jsonb')
  ageDistribution: Record<string, number>;

  @Column('jsonb')
  genderDistribution: Record<string, number>;

  @Column('jsonb')
  incomeDistribution: Record<string, number>;

  @Column('jsonb')
  geographicDistribution: Record<string, number>;

  @Column('jsonb')
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string[];
    personality: Record<string, number>;
  };

  @Column('jsonb')
  behaviorPatterns: Record<string, any>;

  @Column()
  analysisDate: Date;
}
```

### prediction.entity.ts
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  modelName: string;

  @Column()
  targetVariable: string;

  @Column()
  industry: string;

  @Column('jsonb')
  inputFeatures: Record<string, any>;

  @Column('decimal', { precision: 15, scale: 2 })
  predictedValue: number;

  @Column('decimal', { precision: 10, scale: 4 })
  confidence: number;

  @Column('decimal', { precision: 10, scale: 4 })
  accuracy: number;

  @Column('jsonb')
  modelMetrics: {
    mse: number;
    rmse: number;
    mae: number;
    r2Score: number;
  };

  @Column()
  predictionHorizon: string; // '1month', '3months', '1year', etc.

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  validUntil: Date;
}
```

### benchmark.entity.ts
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('benchmarks')
export class Benchmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  industry: string;

  @Column()
  metric: string;

  @Column('decimal', { precision: 15, scale: 2 })
  industryAverage: number;

  @Column('decimal', { precision: 15, scale: 2 })
  topPerformer: number;

  @Column('decimal', { precision: 15, scale: 2 })
  bottomPerformer: number;

  @Column('jsonb')
  percentiles: Record<string, number>;

  @Column('jsonb')
  competitorData: Array<{
    name: string;
    value: number;
    marketShare: number;
  }>;

  @CreateDateColumn()
  lastUpdated: Date;

  @Column()
  dataSource: string;
}
```

## 3. DTOs

### analytics-query.dto.ts
```typescript
import { IsOptional, IsString, IsDateString, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 100;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  offset?: number = 0;
}
```

### trend-analysis.dto.ts
```typescript
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export class TrendAnalysisDto {
  @IsString()
  industry: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
  granularity?: string = 'monthly';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  forecastMonths?: number = 6;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(0.99)
  confidenceLevel?: number = 0.95;
}
```

## 4. Services

### data-warehouse.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AnalyticsData } from '../entities/analytics-data.entity';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

@Injectable()
export class DataWarehouseService {
  constructor(
    @InjectRepository(AnalyticsData)
    private analyticsDataRepository: Repository<AnalyticsData>,
  ) {}

  async executeComplexQuery(queryDto: AnalyticsQueryDto): Promise<any> {
    const queryBuilder = this.analyticsDataRepository
      .createQueryBuilder('ad')
      .select([
        'ad.industry',
        'ad.category',
        'COUNT(*) as count',
        'AVG(ad.value) as avgValue',
        'SUM(ad.value) as totalValue',
        'MIN(ad.value) as minValue',
        'MAX(ad.value) as maxValue',
        'STDDEV(ad.value) as stdDev',
      ])
      .where('ad.isActive = :isActive', { isActive: true });

    this.applyFilters(queryBuilder, queryDto);

    return queryBuilder
      .groupBy('ad.industry, ad.category')
      .orderBy('totalValue', 'DESC')
      .limit(queryDto.limit)
      .offset(queryDto.offset)
      .getRawMany();
  }

  async getTimeSeriesData(queryDto: AnalyticsQueryDto): Promise<any[]> {
    const queryBuilder = this.analyticsDataRepository
      .createQueryBuilder('ad')
      .select([
        'DATE_TRUNC(\'day\', ad.timestamp) as date',
        'ad.industry',
        'ad.category',
        'SUM(ad.value) as dailyTotal',
        'AVG(ad.value) as dailyAverage',
        'COUNT(*) as recordCount',
      ]);

    this.applyFilters(queryBuilder, queryDto);

    return queryBuilder
      .groupBy('DATE_TRUNC(\'day\', ad.timestamp), ad.industry, ad.category')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async aggregateByDimensions(dimensions: string[], metrics: string[], filters: any): Promise<any[]> {
    const selectClauses = [
      ...dimensions.map(dim => `ad.${dim}`),
      ...metrics.map(metric => this.getMetricClause(metric)),
    ];

    const queryBuilder = this.analyticsDataRepository
      .createQueryBuilder('ad')
      .select(selectClauses);

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        queryBuilder.andWhere(`ad.${key} = :${key}`, { [key]: filters[key] });
      }
    });

    return queryBuilder
      .groupBy(dimensions.map(dim => `ad.${dim}`).join(', '))
      .getRawMany();
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<AnalyticsData>, queryDto: AnalyticsQueryDto): void {
    if (queryDto.industry) {
      queryBuilder.andWhere('ad.industry = :industry', { industry: queryDto.industry });
    }

    if (queryDto.category) {
      queryBuilder.andWhere('ad.category = :category', { category: queryDto.category });
    }

    if (queryDto.startDate) {
      queryBuilder.andWhere('ad.timestamp >= :startDate', { startDate: queryDto.startDate });
    }

    if (queryDto.endDate) {
      queryBuilder.andWhere('ad.timestamp <= :endDate', { endDate: queryDto.endDate });
    }
  }

  private getMetricClause(metric: string): string {
    const metricMap = {
      'sum': 'SUM(ad.value) as sum',
      'avg': 'AVG(ad.value) as avg',
      'count': 'COUNT(*) as count',
      'min': 'MIN(ad.value) as min',
      'max': 'MAX(ad.value) as max',
      'stddev': 'STDDEV(ad.value) as stddev',
    };

    return metricMap[metric] || 'COUNT(*) as count';
  }
}
```

### trend-analysis.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trend } from '../entities/trend.entity';
import { AnalyticsData } from '../entities/analytics-data.entity';
import { TrendAnalysisDto } from '../dto/trend-analysis.dto';

@Injectable()
export class TrendAnalysisService {
  constructor(
    @InjectRepository(Trend)
    private trendRepository: Repository<Trend>,
    @InjectRepository(AnalyticsData)
    private analyticsDataRepository: Repository<AnalyticsData>,
  ) {}

  async analyzeTrends(dto: TrendAnalysisDto): Promise<Trend[]> {
    // Get historical data
    const historicalData = await this.getHistoricalData(dto);
    
    // Calculate trends for each category
    const trends = [];
    const categories = [...new Set(historicalData.map(d => d.category))];

    for (const category of categories) {
      const categoryData = historicalData.filter(d => d.category === category);
      const trend = await this.calculateTrend(dto.industry, category, categoryData, dto);
      trends.push(trend);
    }

    // Save trends to database
    return this.trendRepository.save(trends);
  }

  async getForecast(industry: string, category: string, months: number): Promise<any> {
    const trend = await this.trendRepository.findOne({
      where: { industry, category },
      order: { createdAt: 'DESC' },
    });

    if (!trend) {
      throw new Error('No trend data available for forecasting');
    }

    return this.generateForecast(trend.dataPoints, months);
  }

  private async getHistoricalData(dto: TrendAnalysisDto): Promise<any[]> {
    const queryBuilder = this.analyticsDataRepository
      .createQueryBuilder('ad')
      .select([
        `DATE_TRUNC('${dto.granularity}', ad.timestamp) as period`,
        'ad.category',
        'SUM(ad.value) as value',
        'COUNT(*) as count',
      ])
      .where('ad.industry = :industry', { industry: dto.industry })
      .andWhere('ad.isActive = :isActive', { isActive: true })
      .andWhere('ad.timestamp >= :startDate', { 
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
      });

    if (dto.category) {
      queryBuilder.andWhere('ad.category = :category', { category: dto.category });
    }

    return queryBuilder
      .groupBy(`DATE_TRUNC('${dto.granularity}', ad.timestamp), ad.category`)
      .orderBy('period', 'ASC')
      .getRawMany();
  }

  private async calculateTrend(industry: string, category: string, data: any[], dto: TrendAnalysisDto): Promise<Trend> {
    const dataPoints = data.map(d => ({
      date: d.period,
      value: parseFloat(d.value),
    }));

    // Calculate growth rate using linear regression
    const { slope, r2 } = this.linearRegression(dataPoints);
    const growthRate = slope;
    const confidence = r2;

    // Determine trend direction
    let trendDirection: 'up' | 'down' | 'stable';
    if (Math.abs(growthRate) < 0.01) {
      trendDirection = 'stable';
    } else if (growthRate > 0) {
      trendDirection = 'up';
    } else {
      trendDirection = 'down';
    }

    // Generate forecast
    const forecast = this.generateForecast(dataPoints, dto.forecastMonths || 6);

    const trend = new Trend();
    trend.name = `${industry}-${category}-trend`;
    trend.industry = industry;
    trend.category = category;
    trend.dataPoints = dataPoints;
    trend.growthRate = growthRate;
    trend.confidence = confidence;
    trend.trendDirection = trendDirection;
    trend.forecast = forecast;
    trend.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Valid for 30 days

    return trend;
  }

  private linearRegression(dataPoints: Array<{ date: any; value: number }>): { slope: number; r2: number } {
    const n = dataPoints.length;
    if (n < 2) return { slope: 0, r2: 0 };

    // Convert dates to numeric values (months since first date)
    const x = dataPoints.map((_, i) => i);
    const y = dataPoints.map(d => d.value);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    const ssRes = y.reduce((acc, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return acc + Math.pow(yi - predicted, 2);
    }, 0);
    const ssTot = y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return { slope, r2: Math.max(0, r2) };
  }

  private generateForecast(dataPoints: Array<{ date: any; value: number }>, months: number): Array<{ date: string; predicted: number; confidence: number }> {
    if (dataPoints.length < 2) return [];

    const { slope } = this.linearRegression(dataPoints);
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const lastDate = new Date(dataPoints[dataPoints.length - 1].date);

    const forecast = [];
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const predicted = lastValue + (slope * i);
      const confidence = Math.max(0.5, 0.95 - (i * 0.05)); // Decreasing confidence over time

      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        predicted: Math.max(0, predicted), // Ensure non-negative predictions
        confidence,
      });
    }

    return forecast;
  }
}
```

### predictive-analytics.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from '../entities/prediction.entity';
import { AnalyticsData } from '../entities/analytics-data.entity';

@Injectable()
export class PredictiveAnalyticsService {
  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    @InjectRepository(AnalyticsData)
    private analyticsDataRepository: Repository<AnalyticsData>,
  ) {}

  async createPredictionModel(modelName: string, targetVariable: string, industry: string): Promise<any> {
    // Get training data
    const trainingData = await this.getTrainingData(industry, targetVariable);
    
    // Train model (simplified linear regression for demonstration)
    const model = await this.trainLinearModel(trainingData);
    
    // Validate model
    const validation = await this.validateModel(model, trainingData);
    
    return {
      modelName,
      targetVariable,
      industry,
      model,
      validation,
      features: this.extractFeatures(trainingData),
    };
  }

  async makePrediction(modelName: string, inputFeatures: Record<string, any>): Promise<Prediction> {
    // Load model (in real implementation, this would be loaded from storage)
    const modelData = await this.loadModel(modelName);
    
    // Make prediction
    const predictedValue = this.predict(modelData, inputFeatures);
    const confidence = this.calculateConfidence(modelData, inputFeatures);
    
    const prediction = new Prediction();
    prediction.modelName = modelName;
    prediction.targetVariable = modelData.targetVariable;
    prediction.industry = modelData.industry;
    prediction.inputFeatures = inputFeatures;
    prediction.predictedValue = predictedValue;
    prediction.confidence = confidence;
    prediction.accuracy = modelData.validation.accuracy;
    prediction.modelMetrics = modelData.validation.metrics;
    prediction.predictionHorizon = '3months';
    prediction.validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    
    return this.predictionRepository.save(prediction);
  }

  async analyzeHitPrediction(industry: string, features: Record<string, any>): Promise<any> {
    // Specific model for predicting hits/success
    const historicalHits = await this.getHistoricalHits(industry);
    const hitModel = this.trainHitPredictionModel(historicalHits);
    
    const hitProbability = this.predictHitProbability(hitModel, features);
    const successFactors = this.identifySuccessFactors(hitModel, features);
    
    return {
      hitProbability,
      successFactors,
      recommendations: this.generateRecommendations(successFactors),
      confidence: hitModel.confidence,
    };
  }

  private async getTrainingData(industry: string, targetVariable: string): Promise<any[]> {
    return this.analyticsDataRepository
      .createQueryBuilder('ad')
      .where('ad.industry = :industry', { industry })
      .andWhere('ad.data ? :targetVariable', { targetVariable })
      .andWhere('ad.isActive = :isActive', { isActive: true })
      .getMany();
  }

  private async trainLinearModel(data: any[]): Promise<any> {
    // Simplified linear regression implementation
    const features = this.extractFeatures(data);
    const target = data.map(d => d.value);
    
    // Calculate coefficients using normal equation: β = (X'X)^(-1)X'y
    const X = this.createDesignMatrix(data, features);
    const coefficients = this.calculateCoefficients(X, target);
    
    return {
      type: 'linear_regression',
      coefficients,
      features,
      intercept: coefficients[0],
    };
  }

  private async validateModel(model: any, data: any[]): Promise<any> {
    const predictions = data.map(d => this.predict(model, d.data));
    const actual = data.map(d => d.value);
    
    const mse = this.calculateMSE(predictions, actual);
    const rmse = Math.sqrt(mse);
    const mae = this.calculateMAE(predictions, actual);
    const r2Score = this.calculateR2(predictions, actual);
    
    return {
      accuracy: Math.max(0, r2Score),
      metrics: {
        mse,
        rmse,
        mae,
        r2Score,
      },
    };
  }

  private extractFeatures(data: any[]): string[] {
    if (data.length === 0) return [];
    
    const sampleData = data[0].data || {};
    return Object.keys(sampleData).filter(key => 
      typeof sampleData[key] === 'number'
    );
  }

  private createDesignMatrix(data: any[], features: string[]): number[][] {
    return data.map(d => {
      const row = [1]; // Intercept term
      features.forEach(feature => {
        row.push(d.data[feature] || 0);
      });
      return row;
    });
  }

  private calculateCoefficients(X: number[][], y: number[]): number[] {
    // Simplified coefficient calculation
    const n = X.length;
    const m = X[0].length;
    
    // Using gradient descent for simplicity
    let coefficients = new Array(m).fill(0);
    const learningRate = 0.01;
    const iterations = 1000;
    
    for (let iter = 0; iter < iterations; iter++) {
      const predictions = X.map(row => 
        row.reduce((sum, val, idx) => sum + val * coefficients[idx], 0)
      );
      
      const errors = predictions.map((pred, idx) => pred - y[idx]);
      
      // Update coefficients
      for (let j = 0; j < m; j++) {
        const gradient = errors.reduce((sum, error, idx) => 
          sum + error * X[idx][j], 0
        ) / n;
        coefficients[j] -= learningRate * gradient;
      }
    }
    
    return coefficients;
  }

  private predict(model: any, features: Record<string, any>): number {
    let prediction = model.intercept || model.coefficients[0];
    
    model.features.forEach((feature: string, idx: number) => {
      const coefficient = model.coefficients[idx + 1] || 0;
      const value = features[feature] || 0;
      prediction += coefficient * value;
    });
    
    return Math.max(0, prediction);
  }

  private calculateConfidence(model: any, features: Record<string, any>): number {
    // Simplified confidence calculation based on feature completeness
    const completeness = model.features.reduce((acc: number, feature: string) => {
      return acc + (features[feature] !== undefined ? 1 : 0);
    }, 0) / model.features.length;
    
    return Math.min(0.95, 0.5 + completeness * 0.4);
  }

  private calculateMSE(predictions: number[], actual: number[]): number {
    const n = predictions.length;
    return predictions.reduce((sum, pred, idx) => 
      sum + Math.pow(pred - actual[idx], 2), 0
    ) / n;
  }

  private calculateMAE(predictions: number[], actual: number[]): number {
    const n = predictions.length;
    return predictions.reduce((sum, pred, idx) => 
      sum + Math.abs(pred - actual[idx]), 0
    ) / n;
  }

  private calculateR2(predictions: number[], actual: number[]): number {
    const meanActual = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    
    const ssRes = predictions.reduce((sum, pred, idx) => 
      sum + Math.pow(actual[idx]