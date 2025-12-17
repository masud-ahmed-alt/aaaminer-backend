/**
 * Test Setup Configuration
 * Sets up test environment before running tests
 */

import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.COOKIE_NAME = 'test-cookie';
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/aaaminer-test';

// Mock environment variables for testing
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_MAIL = 'test@test.com';
process.env.SMTP_PASSWORD = 'test-password';

// Global test timeout
jest.setTimeout(30000);

// Connect to test database
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'aaaminer-test'
    });
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('✅ Test database cleaned and closed');
  } catch (error) {
    console.error('❌ Error cleaning test database:', error);
  }
});

// Clear all collections before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

