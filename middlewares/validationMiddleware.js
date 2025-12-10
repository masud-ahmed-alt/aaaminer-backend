/**
 * Input Validation Middleware
 * Validates request body, query, and params
 */

import { ErrorHandler } from '../utils/utility.js';

/**
 * Validates required fields in request body
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    fields.forEach((field) => {
      if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return next(
        new ErrorHandler(
          `Missing required fields: ${missing.join(', ')}`,
          400
        )
      );
    }

    next();
  };
};

/**
 * Validates email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength (min 6 characters)
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validates phone number (basic validation)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates numeric value
 */
export const validateNumber = (value, min = null, max = null) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

/**
 * Sanitizes string input (removes dangerous characters)
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validates ObjectId format
 */
export const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Middleware to sanitize request body strings
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  next();
};

