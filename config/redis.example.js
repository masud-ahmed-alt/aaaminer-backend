/**
 * Redis Configuration for Scalability
 * 
 * Install: npm install redis ioredis
 * 
 * This provides:
 * - Caching layer for frequently accessed data
 * - Distributed rate limiting
 * - Socket.IO adapter for horizontal scaling
 * - Session storage (optional)
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false,
});

// Redis connection events
redisClient.on('connect', () => {
  logger.success('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', err);
});

redisClient.on('close', () => {
  logger.warn('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key: ${key}`, error);
      return null;
    }
  },

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   */
  async set(key, value, ttl = 3600) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Cache set error for key: ${key}`, error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key: ${key}`, error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Cache delete pattern error: ${pattern}`, error);
      return 0;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      return await redisClient.exists(key) === 1;
    } catch (error) {
      logger.error(`Cache exists error for key: ${key}`, error);
      return false;
    }
  },
};

/**
 * Cache keys constants
 */
export const CACHE_KEYS = {
  USER: (id) => `user:${id}`,
  USER_LIST: (page, limit) => `users:page:${page}:limit:${limit}`,
  TASKS: 'tasks:all',
  SCRATCH_CARDS: 'scratchcards:all',
  LEADERBOARD: (type) => `leaderboard:${type}`,
  HOME_NOTIFICATION: 'home:notification',
  CAROUSEL: 'carousel:all',
};

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  USER: 300,              // 5 minutes
  USER_LIST: 60,          // 1 minute
  TASKS: 3600,           // 1 hour (tasks regenerate every 2 hours)
  SCRATCH_CARDS: 10800,  // 3 hours (cards regenerate every 5 hours)
  LEADERBOARD: 300,      // 5 minutes
  HOME_NOTIFICATION: 3600, // 1 hour
  CAROUSEL: 3600,        // 1 hour
};

export default redisClient;

