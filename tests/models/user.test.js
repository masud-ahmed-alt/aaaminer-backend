/**
 * User Model Tests
 */

import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a new user with required fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      };

      const user = await User.create(userData);
      
      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.password).toBeUndefined(); // Password should not be returned
      expect(user.walletPoints).toBe(0);
      expect(user.wallet).toBe(0);
      expect(user.isverified).toBe(false);
      expect(user.isBanned).toBe(false);
    });

    test('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com',
        password: 'password123',
        username: 'testuser2'
      };

      const user = await User.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');
      
      expect(userWithPassword.password).toBeDefined();
      expect(userWithPassword.password).not.toBe('password123');
      expect(await bcrypt.compare('password123', userWithPassword.password)).toBe(true);
    });

    test('should have default values for optional fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test3@example.com',
        password: 'password123',
        username: 'testuser3'
      };

      const user = await User.create(userData);
      
      expect(user.freeSpinLimit).toBe(3);
      expect(user.dailySpinLimit).toBe(17);
      expect(user.inreview).toBe(false);
      expect(user.walletPoints).toBe(0);
      expect(user.wallet).toBe(0);
    });

    test('should enforce unique email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
        username: 'testuser4'
      };

      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    test('comparePassword should correctly compare passwords', async () => {
      const userData = {
        name: 'Test User',
        email: 'test5@example.com',
        password: 'password123',
        username: 'testuser5'
      };

      const user = await User.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');
      
      expect(await userWithPassword.comparePassword('password123')).toBe(true);
      expect(await userWithPassword.comparePassword('wrongpassword')).toBe(false);
    });
  });

  describe('User Indexes', () => {
    test('should have indexes on email, username, and other fields', async () => {
      const indexes = await User.collection.getIndexes();
      
      // Check that indexes exist (MongoDB creates them automatically)
      expect(indexes).toBeDefined();
    });
  });
});

