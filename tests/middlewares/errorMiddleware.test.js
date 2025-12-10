/**
 * Error Middleware Tests
 */

import { errorMiddleware, catchAsyncError } from '../../middlewares/errorMiddleware.js';

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('errorMiddleware', () => {
    test('should handle default error', () => {
      const error = new Error('Test error');
      error.statusCode = 500;

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test error'
      });
    });

    test('should set default status code if not provided', () => {
      const error = new Error('Test error');

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should handle ValidationError', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' }
        }
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email is required, Password is required'
      });
    });

    test('should handle duplicate key error', () => {
      const error = {
        code: 11000,
        keyPattern: { email: 1 }
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate field value: email'
      });
    });

    test('should handle CastError', () => {
      const error = {
        name: 'CastError',
        path: 'userId'
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid format for userId'
      });
    });

    test('should handle JWT errors', () => {
      const error = {
        name: 'JsonWebTokenError'
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    });

    test('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError'
      };

      errorMiddleware(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Your token has expired. Please log in again.'
      });
    });
  });

  describe('catchAsyncError', () => {
    test('should catch and forward async errors', async () => {
      const asyncFunction = async () => {
        throw new Error('Async error');
      };

      const wrappedFunction = catchAsyncError(asyncFunction);
      await wrappedFunction(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should pass through successful async functions', async () => {
      const asyncFunction = async () => {
        res.json({ success: true });
      };

      const wrappedFunction = catchAsyncError(asyncFunction);
      await wrappedFunction(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

