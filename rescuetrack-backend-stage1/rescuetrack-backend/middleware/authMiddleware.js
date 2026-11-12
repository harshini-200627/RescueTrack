
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/generateToken.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Not authorized. Missing or malformed token');
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Not authorized. User no longer exists');
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authorized'));
  }

  const userRole = String(req.user.role || '').trim().toLowerCase();
  const allowedRoles = roles.map(role => String(role).trim().toLowerCase());

  console.log('[RescueTrack permission debug]', {
    method: req.method,
    path: req.originalUrl,
    userRole,
    allowedRoles,
  });

  if (!allowedRoles.includes(userRole)) {
    return next(
      new ApiError(
        403,
        'You do not have permission to perform this action'
      )
    );
  }

  return next();
};
