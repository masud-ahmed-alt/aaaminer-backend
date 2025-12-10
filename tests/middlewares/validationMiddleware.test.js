/**
 * Validation Middleware Tests
 */

import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePhone,
  validateNumber,
  sanitizeString,
  validateObjectId,
  sanitizeBody
} from '../../middlewares/validationMiddleware.js';
import { ErrorHandler } from '../../utils/utility.js';

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next = jest.fn();
  });

  describe('validateRequired', () => {
    test('should pass when all required fields are present', () => {
      req.body = { name: 'Test', email: 'test@example.com' };
      const middleware = validateRequired(['name', 'email']);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should fail when required fields are missing', () => {
      req.body = { name: 'Test' };
      const middleware = validateRequired(['name', 'email']);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(ErrorHandler));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('email');
    });
  });

  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should validate passwords with minimum length', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
    });

    test('should reject short passwords', () => {
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
    });
  });

  describe('validatePhone', () => {
    test('should validate phone numbers', () => {
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('123-456-7890')).toBe(true);
      expect(validatePhone('(123) 456-7890')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
    });
  });

  describe('validateNumber', () => {
    test('should validate numbers within range', () => {
      expect(validateNumber(5, 1, 10)).toBe(true);
      expect(validateNumber('5', 1, 10)).toBe(true);
    });

    test('should reject numbers outside range', () => {
      expect(validateNumber(15, 1, 10)).toBe(false);
      expect(validateNumber(0, 1, 10)).toBe(false);
    });

    test('should validate without min/max', () => {
      expect(validateNumber(5)).toBe(true);
      expect(validateNumber('abc')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    test('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('normal text')).toBe('normal text');
    });

    test('should trim strings', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });
  });

  describe('validateObjectId', () => {
    test('should validate MongoDB ObjectIds', () => {
      expect(validateObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(validateObjectId('507f191e810c19729de860ea')).toBe(true);
    });

    test('should reject invalid ObjectIds', () => {
      expect(validateObjectId('invalid')).toBe(false);
      expect(validateObjectId('123')).toBe(false);
      expect(validateObjectId('')).toBe(false);
    });
  });

  describe('sanitizeBody', () => {
    test('should sanitize string fields in request body', () => {
      req.body = {
        name: '<script>alert("xss")</script>',
        email: '  test@example.com  ',
        number: 123
      };

      sanitizeBody(req, res, next);

      expect(req.body.name).toBe('scriptalert("xss")/script');
      expect(req.body.email).toBe('test@example.com');
      expect(req.body.number).toBe(123); // Numbers should remain unchanged
      expect(next).toHaveBeenCalled();
    });
  });
});

