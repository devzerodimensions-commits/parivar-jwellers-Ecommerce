import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.js';
import { can, isAdminRole } from '../config/roles.js';

// Pull a bearer token from the Authorization header or the auth cookie.
const getTokenFromRequest = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

// Require a valid logged-in user.
export const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Reject pre-2FA challenge tokens — they are not full auth tokens.
  if (decoded.stage) {
    res.status(401);
    throw new Error('Not authorized, complete two-factor verification.');
  }
  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Not authorized, user not found or inactive.');
  }

  req.user = user;
  next();
});

// Require access to the admin area at all (any staff role). Use after `protect`.
export const admin = (req, res, next) => {
  if (req.user && isAdminRole(req.user.role)) return next();
  res.status(403);
  throw new Error('Admin access required.');
};

// Require a specific section capability (use after `protect`).
export const requireCap = (section) => (req, res, next) => {
  if (req.user && can(req.user.role, section)) return next();
  res.status(403);
  throw new Error('You do not have permission to access this section.');
};

// Attach the user if a valid token is present, but never block the request.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) req.user = user;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
});
