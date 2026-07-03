import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES } from '../config/roles.js';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: String,
    phone: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_.-]{3,30}$/, 'Username may use letters, numbers, . _ - (3–30 chars)'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: { type: String, trim: true },
    role: { type: String, enum: ROLES, default: 'subscriber' },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    avatar: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ---- Two-Factor Authentication ----
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['email', 'app'], default: 'email' },
    twoFactorSecret: { type: String, select: false }, // TOTP secret (authenticator app)
    twoFactorTempSecret: { type: String, select: false }, // pending TOTP secret during setup
    loginOtp: { type: String, select: false }, // hashed email OTP
    loginOtpExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before save (only when modified).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plaintext password against the stored hash.
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Generate a password-reset token; store the hashed version, return the raw one.
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

// Generate a 6-digit email login OTP; store the hashed version, return the raw code.
userSchema.methods.generateLoginOtp = function () {
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  this.loginOtp = crypto.createHash('sha256').update(code).digest('hex');
  this.loginOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Verify a submitted email OTP against the stored hash + expiry.
userSchema.methods.verifyLoginOtp = function (code) {
  if (!this.loginOtp || !this.loginOtpExpire) return false;
  if (Date.now() > new Date(this.loginOtpExpire).getTime()) return false;
  const hashed = crypto.createHash('sha256').update(String(code)).digest('hex');
  return hashed === this.loginOtp;
};

// Blank username → unset (so the sparse unique index ignores it).
userSchema.pre('save', function (next) {
  if (this.username === '') this.username = undefined;
  next();
});

// Build a unique username from a base string (email local part / name).
userSchema.statics.generateUsername = async function (base) {
  let slug = String(base || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 24);
  if (slug.length < 3) slug = `${slug || 'user'}user`.slice(0, 24);
  let candidate = slug;
  let n = 0;
  while (await this.exists({ username: candidate })) {
    n += 1;
    candidate = `${slug}${n}`.slice(0, 30);
  }
  return candidate;
};

const User = mongoose.model('User', userSchema);
export default User;
