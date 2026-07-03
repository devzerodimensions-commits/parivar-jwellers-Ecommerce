import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  verifyTwoFactor,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  getTwoFactorStatus,
  enableEmailTwoFactor,
  setupAppTwoFactor,
  verifyAppTwoFactor,
  disableTwoFactor,
} from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/verify-2fa', [body('challenge').notEmpty(), body('code').notEmpty()], validate, verifyTwoFactor);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.put(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  validate,
  resetPassword
);

// ---- Two-Factor management (logged-in user) ----
router.get('/2fa', protect, getTwoFactorStatus);
router.post('/2fa/email/enable', protect, enableEmailTwoFactor);
router.post('/2fa/app/setup', protect, setupAppTwoFactor);
router.post('/2fa/app/verify', protect, verifyAppTwoFactor);
router.post('/2fa/disable', protect, disableTwoFactor);

export default router;
