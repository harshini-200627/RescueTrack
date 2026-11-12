/**
 * Secure administrator initialization.
 *
 * Usage:  npm run seed:admin
 *
 * Reads ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from the environment (.env),
 * creates the administrator if no account with that email exists, and exits.
 * Nothing is hardcoded, the password is hashed by the User model, and it is never
 * printed. Remove ADMIN_PASSWORD from .env after running this once.
 */
import mongoose from 'mongoose';
import config, { validateEnv } from '../config/env.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import {
  isString,
  isValidEmail,
  isStrongPassword,
  normalizeEmail,
  PASSWORD_RULES_MESSAGE,
} from '../utils/validators.js';

const run = async () => {
  validateEnv();

  const name = (process.env.ADMIN_NAME || '').trim();
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;

  if (name.length < 2 || name.length > 80) {
    throw new Error('ADMIN_NAME must be 2-80 characters');
  }
  if (!isValidEmail(email)) {
    throw new Error('ADMIN_EMAIL must be a valid email address');
  }
  if (!isString(password) || !isStrongPassword(password)) {
    throw new Error(`ADMIN_PASSWORD is missing or weak. ${PASSWORD_RULES_MESSAGE}`);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`Administrator ${email} already exists. Nothing to do.`);
    } else {
      console.log(
        `An account with ${email} already exists with role "${existing.role}". ` +
          'It was NOT modified. Use a different ADMIN_EMAIL.'
      );
    }
    return;
  }

  await User.create({ name, email, password, role: 'admin' });
  console.log(`Administrator created: ${email}`);
  console.log('Now remove ADMIN_PASSWORD from your .env file.');
};

run()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
    process.exit(process.exitCode || 0);
  });
