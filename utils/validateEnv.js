const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'COOKIE_NAME',
  'SMTP_HOST',
  'SMTP_MAIL',
  'SMTP_PASSWORD',
];

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'CORS_ORIGINS',
  'TEL_BOT_TOKEN',
  'CHAT_ID',
  // Cloudinary configuration (optional, falls back to local storage if missing)
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_FOLDER',
  'CLOUDINARY_CAROUSAL_FOLDER',
];

export const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional but recommended variables
  optionalEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`❌ ${errorMsg}`);
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    throw new Error(errorMsg);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:');
    warnings.forEach((varName) => {
      console.warn(`   - ${varName}`);
    });
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long');
  }

  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    throw new Error('PORT must be a valid number');
  }

  const dkimVars = ['DOMAIN', 'KEY_SELECTOR', 'DKIM_PRIVATE_KEY'];
  const dkimVarsPresent = dkimVars.filter(varName => process.env[varName] && process.env[varName].trim()).length;
  if (dkimVarsPresent > 0 && dkimVarsPresent < dkimVars.length) {
    console.warn('⚠️  DKIM configuration is incomplete. Either provide all DKIM variables (DOMAIN, KEY_SELECTOR, DKIM_PRIVATE_KEY) or none.');
    console.warn('   Note: DOMAIN will be extracted from SMTP_MAIL if not provided.');
  }
};

