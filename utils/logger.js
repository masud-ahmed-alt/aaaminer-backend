/**
 * Structured Logging Utility
 * Provides consistent logging throughout the application
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const logData = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${level}] ${message}${logData}`;
};

export const logger = {
  info: (message, data = null) => {
    const formatted = formatMessage('INFO', message, data);
    console.log(`${colors.cyan}${formatted}${colors.reset}`);
  },

  success: (message, data = null) => {
    const formatted = formatMessage('SUCCESS', message, data);
    console.log(`${colors.green}${formatted}${colors.reset}`);
  },

  warn: (message, data = null) => {
    const formatted = formatMessage('WARN', message, data);
    console.warn(`${colors.yellow}${formatted}${colors.reset}`);
  },

  error: (message, error = null) => {
    const formatted = formatMessage('ERROR', message, error);
    console.error(`${colors.red}${formatted}${colors.reset}`);
    
    // Log stack trace if error object provided
    if (error && error.stack) {
      console.error(`${colors.red}Stack: ${error.stack}${colors.reset}`);
    }
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const formatted = formatMessage('DEBUG', message, data);
      console.log(`${colors.magenta}${formatted}${colors.reset}`);
    }
  },
};

