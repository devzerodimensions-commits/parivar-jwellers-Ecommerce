import jwt from 'jsonwebtoken';
import { createRequire } from 'module';

// otplib & qrcode are CommonJS with awkward ESM export maps — load via require.
const require = createRequire(import.meta.url);
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

// Allow a small clock drift (±1 step) when verifying authenticator codes.
authenticator.options = { window: 1 };

const ISSUER = process.env.TWOFA_ISSUER || 'Parivar Jewellers';

// ---- Challenge token (issued after the password step; NOT a full auth token) ----
export const signTwoFactorChallenge = (userId) =>
  jwt.sign({ id: userId, stage: '2fa' }, process.env.JWT_SECRET, { expiresIn: '10m' });

export const verifyTwoFactorChallenge = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.stage !== '2fa') throw new Error('Invalid challenge token.');
  return decoded.id;
};

// ---- TOTP (authenticator app) ----
export const generateTotpSecret = () => authenticator.generateSecret();

export const totpKeyUri = (email, secret) => authenticator.keyuri(email, ISSUER, secret);

export const verifyTotp = (token, secret) => {
  if (!token || !secret) return false;
  try {
    return authenticator.check(String(token).trim(), secret);
  } catch {
    return false;
  }
};

export const totpQrDataUrl = (otpauthUrl) => qrcode.toDataURL(otpauthUrl);
