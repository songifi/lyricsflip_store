import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserInteraction } from '../entities/user-interaction.entity';
import { ModelMetadata, ModelType } from '../entities/model-metadata.entity';
import { Matrix } from 'ml-matrix';
import * as tf from '@tensorflow/tfjs-node';

interface TrainingConfig {
  modelType: ModelType;
  parameters: Record<string, any>;
  validationSplit: number;
  epochs: number;
  batchSize: number;
}

interface TrainingResult {
  modelId: string;
  metrics: Record<string, number>;
  modelPath: string;
}

@Injectable()
export class MLTrainingService {
  private readonly logger = new Logger(MLTrainingService.name);

  constructor(
    @InjectRepository(UserInteraction)
    private userInteractionRepository: Repository<UserInteraction>,
    @InjectRepository(ModelMetadata)
    private modelMetadataRepository: Repository<ModelMetadata>,
    @InjectQueue('recommendation-training')
    private trainingQueue: Queue,
  ) {}

  async scheduleModelTraining(config: TrainingConfig): Promise<void> {
    await this.trainingQueue.add('train-model', config, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async trainCollaborativeFilteringModel(config: TrainingConfig): Promise<TrainingResult> {
    this.logger.log('Starting collaborative filtering model training');

    try {
      // Prepare training data
      const { userItemMatrix, userMapping, itemMapping } = await this.prepareCollaborativeData();
      
      // Split data for validation
      const { trainMatrix, validationMatrix } = this.splitDataForValidation(
        userItemMatrix,
        config.validationSplit,
      );

      // Train matrix factorization model
      const model = await this.trainMatrixFactorization(trainMatrix, config);
      
      // Evaluate model
      const metrics = await this.evaluateModel(model, validationMatrix, userMapping, itemMapping);
      
      // Save model
      const modelPath = await this.saveModel(model, config.modelType);
      
      // Store model metadata
      const modelMetadata = await this.saveModelMetadata({
        modelType: config.modelType,
        parameters: config.parameters,
        metrics,
        modelPath,
      });

      this.logger.log(`Collaborative filtering model training completed. Model ID: ${modelMetadata.id}`);

      return {
        modelId: modelMetadata.id,
        metrics,
        modelPath,
      };
    } catch (error) {
      this.logger.error(`Error training collaborative filtering model: ${error.message}`);
      throw error;
    }
  }

  async trainContentBasedModel(config: TrainingConfig): Promise<TrainingResult> {
    this.logger.log('Starting content-based model training');

    try {
      // Prepare content features
      const { features, labels, trackMapping } = await this.prepareContentBasedData();
      
      // Create TensorFlow model
      const model = this.createContentBasedModel(features.shape[1]);
      
      // Train model
      const history = await model.fit(features, labels, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: config.validationSplit,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.logger.log(`Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}`);
          },
        },
      });

      // Evaluate model
      const metrics = this.extractMetricsFromHistory(history);
      
      // Save model
      const modelPath = await this.saveModel(model, config.modelType);
      
      // Store model metadata
      const modelMetadata = await this.saveModelMetadata({
        modelType: config.modelType,
        parameters: config.parameters,
        metrics,
        modelPath,
      });

      this.logger.log(`Content-based model training completed. Model ID: ${modelMetadata.id}`);

      return {
        modelId: modelMetadata.id,
        metrics,
        modelPath,
      };
    } catch (error) {
      this.logger.error(`Error training content-based model: ${error.message}`);
      throw error;
    }
  }

  async trainDeepLearningModel(config: TrainingConfig): Promise<TrainingResult> {
    this.logger.log('Starting deep learning model training');

    try {
      // Prepare hybrid data (user features + content features)
      const { userFeatures, itemFeatures, interactions } = await this.prepareHybridData();
      
      // Create neural collaborative filtering model
      const model = this.createNeuralCollaborativeFilteringModel(
        userFeatures.shape[1],
        itemFeatures.shape[1],
        config.parameters,
      );

      // Prepare training data
      const { trainX, trainY, validX, validY } = this.prepareTrainingData(
        userFeatures,
        itemFeatures,
        interactions,
        config.validationSplit,
      );

      // Train model
      const history = await model.fit(trainX, trainY, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationData: [validX, validY],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.logger.log(`Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}`);
          },
        },
      });

      // Evaluate model
      const metrics = this.extractMetricsFromHistory(history);
      
      // Save model
      const modelPath = await this.saveModel(model, config.modelType);
      
      // Store model metadata
      const modelMetadata = await this.saveModelMetadata({
        modelType: config.modelType,
        parameters: config.parameters,
        metrics,
        modelPath,
      });

      this.logger.log(`Deep learning model training completed. Model ID: ${modelMetadata.id}`);

      return {
        modelId: modelMetadata.id,
        metrics,
        modelPath,
      };
    } catch (error) {
      this.logger.error(`Error training deep learning model: ${error.message}`);
      throw error;
    }
  }

  private async prepareCollaborativeData(): Promise<{
    userItemMatrix: Matrix;
    userMapping: Map<string, number>;
    itemMapping: Map<string, number>;
  }> {
    const interactions = await this.userInteractionRepository.find();
    
    const userIds = [...new Set(interactions.map(i => i.userId))];
    const itemIds = [...new Set(interactions.map(i => i.trackId))];
    
    const userMapping = new Map(userIds.map((id, index) => [id, index]));
    const itemMapping = new Map(itemIds.map((id, index) => [id, index]));
    
    const matrix = Matrix.zeros(userIds.length, itemIds.length);
    
    for (const interaction of interactions) {
      const userIndex = userMapping.get(interaction.userId);
      const itemIndex = itemMapping.get(interaction.trackId);
      
      if (userIndex !== undefined && itemIndex !== undefined) {
        const weight = this.getInteractionWeight(interaction.interactionType);
        matrix.set(userIndex, itemIndex, weight);
      }
    }
    
    return { userItemMatrix: matrix, userMapping, itemMapping };
  }

  private async trainMatrixFactorization(
    matrix: Matrix,
    config: TrainingConfig,
  ): Promise<{ userFactors: Matrix; itemFactors: Matrix }> {
    const { factors = 50, learningRate = 0.01, regularization = 0.01, iterations = 100 } = config.parameters;
    
    const numUsers = matrix.rows;
    const numItems = matrix.columns;
    
    // Initialize factor matrices with small random values
    let userFactors = Matrix.random(numUsers, factors).mul(0.1);
    let itemFactors = Matrix.random(numItems, factors).mul(0.1);
    
    // Stochastic gradient descent
    for (let iter = 0; iter < iterations; iter++) {
      let totalError = 0;
      let count = 0;
      
      for (let u = 0; u < numUsers; u++) {
        for (let i = 0; i < numItems; i++) {
          const rating = matrix.get(u, i);
          if (rating > 0) {
            // Predict rating
            const userVec = userFactors.getRow(u);
            const itemVec = itemFactors.getRow(i);
            const prediction = userVec.dot(itemVec);
            
            // Calculate error
            const error = rating - prediction;
            totalError += error * error;
            count++;
            
            // Update factors
            for (let f = 0; f < factors; f++) {
              const userFeature = userFactors.get(u, f);
              const itemFeature = itemFactors.get(i, f);
              
              userFactors.set(u, f, userFeature + learningRate * (error * itemFeature - regularization * userFeature));
              itemFactors.set(i, f, itemFeature + learningRate * (error * userFeature - regularization * itemFeature));
            }
          }
        }
      }
      
      const rmse = Math.sqrt(totalError / count);
      if (iter % 10 === 0) {
        this.logger.log(`Iteration ${iter}: RMSE = ${rmse.toFixed(4)}`);
      }
    }
    
    return { userFactors, itemFactors };
  }

  private createContentBasedModel(inputDim: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [inputDim], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private createNeuralCollaborativeFilteringModel(
    userFeatureDim: number,
    itemFeatureDim: number,
    parameters: Record<string, any>,
  ): tf.LayersModel {
    const { embeddingDim = 50, hiddenUnits = [128, 64, 32] } = parameters;

    // User input
    const userInput = tf.input({ shape: [userFeatureDim] });
    const userEmbedding = tf.layers.dense({ units: embeddingDim, activation: 'relu' }).apply(userInput);

    // Item input
    const itemInput = tf.input({ shape: [itemFeatureDim] });
    const itemEmbedding = tf.layers.dense({ units: embeddingDim, activation: 'relu' }).apply(itemInput);

    // Concatenate embeddings
    const concat = tf.layers.concatenate().apply([userEmbedding, itemEmbedding]);

    // Hidden layers
    let hidden = concat;
    for (const units of hiddenUnits) {
      hidden = tf.layers.dense({ units, activation: 'relu' }).apply(hidden);
      hidden = tf.layers.dropout({ rate: 0.3 }).apply(hidden);
    }

    // Output layer
    const output = tf.layers.dense({ units: 1, activation: 'sigmoid' }).apply(hidden);

    const model = tf.model({ inputs: [userInput, itemInput], outputs: output });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private async saveModel(model: any, modelType: ModelType): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const modelPath = `models/${modelType}_${timestamp}`;
    
    if (model.save) {
      // TensorFlow model
      await model.save(`file://${modelPath}`);
    } else {
      // Custom model (matrix factorization)
      // Save as JSON or binary format
      // Implementation depends on your storage strategy
    }
    
    return modelPath;
  }

  private async saveModelMetadata(data: {
    modelType: ModelType;
    parameters: Record<string, any>;
    metrics: Record<string, any>;
    modelPath: string;
  }): Promise<ModelMetadata> {
    const modelMetadata = this.modelMetadataRepository.create({
      ...data,
      version: '1.0.0',
      isActive: true,
      trainedAt: new Date(),
    });

    return this.modelMetadataRepository.save(modelMetadata);
  }

  private getInteractionWeight(interactionType: string): number {
    const weights = {
      'like': 5,
      'add_to_playlist': 4,
      'download': 4,
      'share': 3,
      'play': 2,
      'skip': -1,
      'dislike': -3,
    };

    return weights[interactionType] || 1;
  }

  // Additional helper methods would be implemented here...
  private splitDataForValidation(matrix: Matrix, validationSplit: number): any {
    // Implementation for splitting data
    return { trainMatrix: matrix, validationMatrix: matrix };
  }

  private async evaluateModel(model: any, validationMatrix: Matrix, userMapping: Map<string, number>, itemMapping: Map<string, number>): Promise<Record<string, number>> {
    // Implementation for model evaluation
    return { rmse: 0.5, precision: 0.8, recall: 0.7 };
  }

  private async prepareContentBasedData(): Promise<any> {
    // Implementation for preparing content-based training data
    return { features: tf.zeros([100, 10]), labels: tf.zeros([100, 1]), trackMapping: new Map() };
  }

  private async prepareHybridData(): Promise<any> {
    // Implementation for preparing hybrid training data
    return {
      userFeatures: tf.zeros([100, 10]),
      itemFeatures: tf.zeros([100, 10]),
      interactions: tf.zeros([100, 1])
    };
  }

  private extractMetricsFromHistory(history: any): Record<string, number> {
    const finalEpoch = history.history;
    return {
      loss: finalEpoch.loss[finalEpoch.loss.length - 1],
      val_loss: finalEpoch.val_loss[finalEpoch.val_loss.length - 1],
      accuracy: finalEpoch.accuracy[finalEpoch.accuracy.length - 1],
      val_accuracy: finalEpoch.val_accuracy[finalEpoch.val_accuracy.length - 1],
    };
  }

  private prepareTrainingData(userFeatures: any, itemFeatures: any, interactions: any, validationSplit: number): any {
    // Implementation for preparing training data for neural networks
    return {
      trainX: [userFeatures, itemFeatures],
      trainY: interactions,
      validX: [userFeatures, itemFeatures],
      validY: interactions,
    };
  }
}