const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export const isString = (value) => typeof value === 'string';

export const normalizeEmail = (value) => (isString(value) ? value.trim().toLowerCase() : '');

export const isValidEmail = (value) =>
  isString(value) && value.length <= 254 && EMAIL_REGEX.test(value);

/**
 * 8-72 characters (bcrypt only uses the first 72 bytes), with at least one
 * lowercase letter, one uppercase letter and one digit.
 */
export const isStrongPassword = (value) => isString(value) && PASSWORD_REGEX.test(value);

export const PASSWORD_RULES_MESSAGE =
  'Password must be 8-72 characters and include an uppercase letter, a lowercase letter and a number';
