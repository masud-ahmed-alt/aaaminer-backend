/**
 * API Integration Tests
 * Tests the API endpoints end-to-end
 */

import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from '../../middlewares/errorMiddleware.js';
import authRoutes from '../../routes/authRoutes.js';
import adminRoutes from '../../routes/adminRoutes.js';
import taskRoutes from '../../routes/taskRoutes.js';
import User from '../../models/User.js';
import Admin from '../../models/Admin.js';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use(errorMiddleware);

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    test('GET / should return home page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });

  describe('User Registration', () => {
    test('POST /api/v1/auth/register should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'register@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });

    test('POST /api/v1/auth/register should reject duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
    });

    test('POST /api/v1/auth/register should reject invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('User Login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123',
        username: 'logintest'
      });
    });

    test('POST /api/v1/auth/login should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.cookies).toBeDefined();
    });

    test('POST /api/v1/auth/login should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    test('POST /api/v1/auth/login should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Admin Routes', () => {
    let adminCookie;

    beforeEach(async () => {
      const admin = await Admin.create({
        adminCode: 'TEST001',
        adminName: 'Test Admin',
        password: 'admin123'
      });

      const loginResponse = await request(app)
        .post('/api/v1/admin/login')
        .send({
          adminCode: 'TEST001',
          password: 'admin123'
        });

      adminCookie = loginResponse.headers['set-cookie'];
    });

    test('GET /api/v1/admin/me should return admin profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/admin/me')
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile).toBeDefined();
    });

    test('GET /api/v1/admin/me should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/admin/me');

      expect(response.status).toBe(401);
    });
  });
});

