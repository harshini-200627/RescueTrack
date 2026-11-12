import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';
import {
  isString,
  isValidEmail,
  isStrongPassword,
  normalizeEmail,
  PASSWORD_RULES_MESSAGE,
} from '../utils/validators.js';

// A valid bcrypt hash used to keep login timing similar when the email is unknown.
const DUMMY_HASH = bcrypt.hashSync('rescuetrack-dummy-password', 10);

/**
 * POST /api/auth/signup
 * Public signup. ALWAYS creates a "responder" - any "role" supplied by the
 * client is ignored, so administrators can never be created through this route.
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  const errors = [];
  if (!isString(name) || name.trim().length < 2 || name.trim().length > 80) {
    errors.push({ field: 'name', message: 'Name must be 2-80 characters' });
  }
  if (!isValidEmail(normalizeEmail(email))) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }
  if (!isStrongPassword(password)) {
    errors.push({ field: 'password', message: PASSWORD_RULES_MESSAGE });
  }
  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'responder', // fixed on purpose - never taken from the request body
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user),
    user,
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!isString(email) || !isString(password) || !email.trim() || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');

  // Always run a bcrypt comparison so response time does not reveal whether the email exists.
  const passwordMatches = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH).then(() => false);

  if (!user || !passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user),
    user,
  });
});

/**
 * GET /api/auth/me  (protected)
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
