/**
 * Scalable Database Configuration
 * Enhanced connection pooling and monitoring for production scale
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = (uri) => {
  const options = {
    dbName: "aaaminer",
    // Connection Pool Settings
    maxPoolSize: 50,              // Maximum number of connections in pool
    minPoolSize: 10,              // Minimum number of connections to maintain
    maxIdleTimeMS: 30000,         // Close connections after 30s of inactivity
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000,        // Socket timeout
    connectTimeoutMS: 10000,       // Connection timeout
    
    // Retry Settings
    retryWrites: true,
    retryReads: true,
    
    // Write Concern (for better durability)
    w: 'majority',
    j: true, // Journal write acknowledgment
    
    // Read Preference (can be changed for read replicas)
    readPreference: 'primary',
  };

  mongoose
    .connect(uri, options)
    .then((data) => {
      logger.success(`Connected to DB: ${data.connection.host}`);
      logger.info(`Database: ${data.connection.name}`);
      logger.info(`Connection Pool: ${data.connection.readyState === 1 ? 'Active' : 'Inactive'}`);
      
      // Monitor connection pool
      monitorConnectionPool(data.connection);
    })
    .catch((err) => {
      logger.error("Database connection failed", err);
      throw err;
    });

  // Handle connection events
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  });
};

/**
 * Monitor connection pool health
 */
const monitorConnectionPool = (connection) => {
  setInterval(() => {
    const poolSize = connection.db?.serverConfig?.poolSize || 0;
    const activeConnections = connection.readyState === 1 ? poolSize : 0;
    
    if (poolSize > 40) {
      logger.warn(`High connection pool usage: ${poolSize}/50`);
    }
    
    logger.debug(`Connection pool: ${activeConnections} active connections`);
  }, 60000); // Check every minute
};

export default connectDB;

