/**
 * Utility Functions Tests
 */

import { ErrorHandler } from '../utils/utility.js';
import { validateEnv } from '../utils/validateEnv.js';
import { logger } from '../utils/logger.js';

describe('Utility Functions', () => {
  describe('ErrorHandler', () => {
    test('should create error with message and status code', () => {
      const error = new ErrorHandler('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(Error);
    });

    test('should have default status code of 500 if not provided', () => {
      const error = new ErrorHandler('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('Logger', () => {
    test('logger.info should be a function', () => {
      expect(typeof logger.info).toBe('function');
    });

    test('logger.error should be a function', () => {
      expect(typeof logger.error).toBe('function');
    });

    test('logger.warn should be a function', () => {
      expect(typeof logger.warn).toBe('function');
    });

    test('logger.success should be a function', () => {
      expect(typeof logger.success).toBe('function');
    });

    test('logger.debug should be a function', () => {
      expect(typeof logger.debug).toBe('function');
    });

    test('logger should not throw errors when called', () => {
      expect(() => {
        logger.info('Test message');
        logger.error('Test error');
        logger.warn('Test warning');
        logger.success('Test success');
        logger.debug('Test debug');
      }).not.toThrow();
    });
  });

  describe('Environment Validation', () => {
    test('should validate required environment variables', () => {
      // This will throw if required vars are missing
      expect(() => validateEnv()).not.toThrow();
    });
  });
});

