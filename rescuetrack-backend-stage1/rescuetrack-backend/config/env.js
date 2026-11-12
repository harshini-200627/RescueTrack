import dotenv from 'dotenv';

dotenv.config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toInt(process.env.PORT, 5000),
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').trim(),
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptSaltRounds: toInt(process.env.BCRYPT_SALT_ROUNDS, 12),
  authRateLimitWindowMinutes: toInt(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES, 15),
  authRateLimitMax: toInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
};

/**
 * Validates the variables the server cannot run safely without.
 * Called once at startup (server.js) before connecting to the database.
 */
export const validateEnv = () => {
  const problems = [];

  if (!config.mongoUri) {
    problems.push('MONGODB_URI is missing. Add your MongoDB Atlas connection string to .env');
  }

  if (!config.jwtSecret) {
    problems.push('JWT_SECRET is missing. Add a long random string (32+ characters) to .env');
  } else if (config.jwtSecret.length < 32) {
    problems.push('JWT_SECRET is too short. Use at least 32 characters.');
  }

  if (problems.length > 0) {
    throw new Error(`Invalid environment configuration:\n - ${problems.join('\n - ')}`);
  }
};

export default config;
