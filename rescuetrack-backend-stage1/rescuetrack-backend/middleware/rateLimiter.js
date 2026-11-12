import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

/**
 * Strict limiter for authentication endpoints (signup / login) to slow down
 * brute-force and credential-stuffing attempts. Limits are per client IP.
 */
export const authLimiter = rateLimit({
  windowMs: config.authRateLimitWindowMinutes * 60 * 1000,
  limit: config.authRateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later',
  },
});
