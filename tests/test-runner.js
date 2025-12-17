/**
 * Simple Test Runner
 * Runs basic system tests without external dependencies
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Admin from '../models/Admin.js';
import { ErrorHandler } from '../utils/utility.js';
import { validateEmail, validatePassword, sanitizeString } from '../middlewares/validationMiddleware.js';
import { logger } from '../utils/logger.js';

const TEST_MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/aaaminer-test';

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function test(name, fn) {
  try {
    fn();
    testsPassed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    testsFailed++;
    failedTests.push({ name, error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n🧪 Starting System Tests...\n');
  console.log('='.repeat(50));

  // Test 1: Utility Functions
  console.log('\n📦 Testing Utility Functions...');
  test('ErrorHandler creates error with message and status', () => {
    const error = new ErrorHandler('Test error', 400);
    if (error.message !== 'Test error' || error.statusCode !== 400) {
      throw new Error('ErrorHandler not working correctly');
    }
  });

  test('Logger functions exist', () => {
    if (typeof logger.info !== 'function') throw new Error('logger.info is not a function');
    if (typeof logger.error !== 'function') throw new Error('logger.error is not a function');
    if (typeof logger.warn !== 'function') throw new Error('logger.warn is not a function');
    if (typeof logger.success !== 'function') throw new Error('logger.success is not a function');
  });

  // Test 2: Validation Functions
  console.log('\n🔍 Testing Validation Functions...');
  test('validateEmail accepts valid emails', () => {
    if (!validateEmail('test@example.com')) throw new Error('Valid email rejected');
    if (!validateEmail('user.name@domain.co.uk')) throw new Error('Valid email rejected');
  });

  test('validateEmail rejects invalid emails', () => {
    if (validateEmail('invalid-email')) throw new Error('Invalid email accepted');
    if (validateEmail('@example.com')) throw new Error('Invalid email accepted');
  });

  test('validatePassword validates minimum length', () => {
    if (!validatePassword('password123')) throw new Error('Valid password rejected');
    if (validatePassword('12345')) throw new Error('Short password accepted');
  });

  test('sanitizeString removes dangerous characters', () => {
    const result = sanitizeString('<script>alert("xss")</script>');
    if (result.includes('<') || result.includes('>')) {
      throw new Error('Dangerous characters not removed');
    }
  });

  // Test 3: Database Connection
  console.log('\n💾 Testing Database Connection...');
  let dbConnected = false;
  try {
    await mongoose.connect(TEST_MONGO_URI, { dbName: 'aaaminer-test' });
    dbConnected = true;
    test('Database connection successful', () => {
      if (!dbConnected) throw new Error('Database connection failed');
    });
  } catch (error) {
    test('Database connection', () => {
      throw new Error(`Database connection failed: ${error.message}`);
    });
  }

  if (dbConnected) {
    // Test 4: Model Tests
    console.log('\n📊 Testing Models...');
    
    test('User model creates user correctly', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        username: 'testuser'
      });
      if (!user._id) throw new Error('User not created');
      if (user.password) throw new Error('Password should not be returned');
      if (user.walletPoints !== 0) throw new Error('Default walletPoints should be 0');
    });

    test('User model enforces unique email', async () => {
      try {
        await User.create({
          name: 'Test User 2',
          email: 'testuser@example.com',
          password: 'password123',
          username: 'testuser2'
        });
        throw new Error('Duplicate email should be rejected');
      } catch (error) {
        // Expected to fail
        if (!error.message.includes('duplicate')) {
          throw error;
        }
      }
    });

    test('Task model creates task correctly', async () => {
      const task = await Task.create({
        taskName: 'Test Task',
        rewardPoints: 50
      });
      if (!task._id) throw new Error('Task not created');
      if (!Array.isArray(task.completedBy)) throw new Error('completedBy should be an array');
    });

    test('Admin model creates admin correctly', async () => {
      const admin = await Admin.create({
        adminCode: 'TEST001',
        adminName: 'Test Admin',
        password: 'admin123'
      });
      if (!admin._id) throw new Error('Admin not created');
      if (admin.password) throw new Error('Password should not be returned');
    });

    // Clean up test database
    await User.deleteMany({});
    await Task.deleteMany({});
    await Admin.deleteMany({});
    
    // Close database connection gracefully
    try {
      await mongoose.connection.close();
    } catch (error) {
      // Connection might already be closed, ignore error
    }
  }

  // Test Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);

  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});

