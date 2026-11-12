import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Signs a JWT for the given user. The payload only carries the user id and role;
 * the role is re-checked against the database on every protected request.
 */
export const generateToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });

/**
 * Verifies a JWT and returns its payload. Throws jsonwebtoken errors on failure.
 */
export const verifyToken = (token) =>
  jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
