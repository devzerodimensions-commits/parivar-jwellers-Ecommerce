import crypto from 'crypto';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import generateToken, { sendTokenCookie } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import {
  signTwoFactorChallenge,
  verifyTwoFactorChallenge,
  generateTotpSecret,
  totpKeyUri,
  totpQrDataUrl,
  verifyTotp,
} from '../utils/twoFactor.js';

// Send a 6-digit login code by email (logged to console in dev without SMTP).
const sendLoginOtpEmail = (user, code) =>
  sendEmail({
    to: user.email,
    subject: 'Your login verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your verification code is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p>
      <p>It expires in 10 minutes. If you did not try to sign in, you can ignore this email.</p>`,
  });

// Shape the public user object returned to clients (never include password).
const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  username: u.username,
  email: u.email,
  phone: u.phone,
  role: u.role,
  avatar: u.avatar,
});

const authResponse = (res, user, status = 200) => {
  const token = generateToken(user._id);
  sendTokenCookie(res, token);
  res.status(status).json({ success: true, token, user: publicUser(user) });
};

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const username = await User.generateUsername(email.split('@')[0]);
  const user = await User.create({ name, email, password, phone, username }); // role defaults to 'subscriber'
  authResponse(res, user, 201);
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been disabled. Please contact support.');
  }

  // ---- Two-Factor Authentication ----
  if (user.twoFactorEnabled) {
    if (user.twoFactorMethod === 'email') {
      const code = user.generateLoginOtp();
      await user.save({ validateBeforeSave: false });
      await sendLoginOtpEmail(user, code);
    }
    // For the authenticator-app method the user reads the code from their app.
    return res.json({
      success: true,
      requires2FA: true,
      method: user.twoFactorMethod,
      challenge: signTwoFactorChallenge(user._id),
    });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  authResponse(res, user);
});

// @route POST /api/auth/verify-2fa  { challenge, code }
export const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { challenge, code } = req.body;
  let userId;
  try {
    userId = verifyTwoFactorChallenge(challenge);
  } catch {
    res.status(401);
    throw new Error('Your verification session expired. Please sign in again.');
  }

  const user = await User.findById(userId).select('+twoFactorSecret +loginOtp +loginOtpExpire');
  if (!user || !user.twoFactorEnabled) {
    res.status(400);
    throw new Error('Two-factor authentication is not active for this account.');
  }

  const ok =
    user.twoFactorMethod === 'app'
      ? verifyTotp(code, user.twoFactorSecret)
      : user.verifyLoginOtp(code);

  if (!ok) {
    res.status(401);
    throw new Error('Invalid or expired verification code.');
  }

  // Clear the one-time email code and finish login.
  user.loginOtp = undefined;
  user.loginOtpExpire = undefined;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  authResponse(res, user);
});

// @route POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out.' });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: publicUser(user) });
});

// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });

  // Always respond success to avoid leaking which emails exist.
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email is registered, a password reset link has been sent.',
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Build the link from the request's own origin so it is valid wherever the
  // app is served from (localhost, a public tunnel, or a real deployment)
  // rather than a hard-coded CLIENT_URL. Admin requests get the /admin path.
  const base =
    req.get('origin') ||
    process.env.CLIENT_URL ||
    `${req.protocol}://${req.get('host')}`;
  const path = req.body.context === 'admin' ? '/admin/reset-password' : '/reset-password';
  const resetUrl = `${base.replace(/\/$/, '')}${path}/${resetToken}`;

  const siteName = process.env.SITE_NAME || 'Parivar Jewellers';

  try {
    const result = await sendEmail({
      to: user.email,
      subject: `Reset your ${siteName} password`,
      text: `Hello ${user.name},\n\nWe received a request to reset your password. Use the link below within 30 minutes to choose a new password:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#8a6d1a">Reset your password</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your ${siteName} password. This link is valid for <strong>30 minutes</strong>:</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#c8a34e;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Reset Password</a></p>
        <p style="font-size:12px;color:#666">Or paste this into your browser:<br><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="font-size:12px;color:#666">If you did not request this, you can safely ignore this email.</p>
      </div>`,
    });

    if (result.delivered) {
      return res.json({
        success: true,
        delivered: true,
        message: 'A password reset link has been sent to your email.',
      });
    }

    // SMTP is not configured, so no email went out. Rather than fail silently,
    // return the reset link directly so the flow still works, and say so plainly.
    return res.json({
      success: true,
      delivered: false,
      resetUrl,
      message:
        'Email delivery is not configured on this server, so we could not send an email. Use the reset link below to continue.',
    });
  } catch (err) {
    // A real send failure — undo the token and surface the error (no silent failure).
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('❌  Password reset email failed:', err.message);
    res.status(502);
    throw new Error('We could not send the reset email right now. Please try again shortly.');
  }
});

// @route PUT /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token.');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  authResponse(res, user);
});

// ---------------- Two-Factor management (require a logged-in user) ----------------

// @route GET /api/auth/2fa
export const getTwoFactorStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    enabled: !!user.twoFactorEnabled,
    method: user.twoFactorMethod,
  });
});

// @route POST /api/auth/2fa/email/enable — turn on email-based 2FA
export const enableEmailTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorSecret +twoFactorTempSecret');
  user.twoFactorEnabled = true;
  user.twoFactorMethod = 'email';
  user.twoFactorSecret = undefined; // not needed for email
  user.twoFactorTempSecret = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, enabled: true, method: 'email' });
});

// @route POST /api/auth/2fa/app/setup — start authenticator-app setup (returns QR + secret)
export const setupAppTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorTempSecret');
  const secret = generateTotpSecret();
  user.twoFactorTempSecret = secret;
  await user.save({ validateBeforeSave: false });

  const otpauthUrl = totpKeyUri(user.email, secret);
  const qr = await totpQrDataUrl(otpauthUrl);
  res.json({ success: true, secret, otpauthUrl, qr });
});

// @route POST /api/auth/2fa/app/verify { code } — confirm the app code and enable
export const verifyAppTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorTempSecret');
  if (!user.twoFactorTempSecret) {
    res.status(400);
    throw new Error('Start the authenticator setup first.');
  }
  if (!verifyTotp(req.body.code, user.twoFactorTempSecret)) {
    res.status(401);
    throw new Error('Invalid code. Check your authenticator app and try again.');
  }
  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorTempSecret = undefined;
  user.twoFactorEnabled = true;
  user.twoFactorMethod = 'app';
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, enabled: true, method: 'app' });
});

// @route POST /api/auth/2fa/disable { password } — turn 2FA off (re-auth with password)
export const disableTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.password || ''))) {
    res.status(401);
    throw new Error('Password is incorrect.');
  }
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorTempSecret = undefined;
  user.loginOtp = undefined;
  user.loginOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, enabled: false });
});
