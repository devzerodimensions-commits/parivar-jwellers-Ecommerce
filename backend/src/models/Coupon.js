import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: String,
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true, min: 0 },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null }, // cap for percentage coupons
    usageLimit: { type: Number, default: null }, // total uses allowed (null = unlimited)
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: null },
    startsAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Validate a coupon against a cart subtotal. Returns
 * { valid, message, discount }.
 */
couponSchema.methods.evaluate = function (subtotal) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'This coupon is inactive.', discount: 0 };
  if (this.startsAt && now < this.startsAt)
    return { valid: false, message: 'This coupon is not active yet.', discount: 0 };
  if (this.expiresAt && now > this.expiresAt)
    return { valid: false, message: 'This coupon has expired.', discount: 0 };
  if (this.usageLimit != null && this.usedCount >= this.usageLimit)
    return { valid: false, message: 'This coupon usage limit has been reached.', discount: 0 };
  if (subtotal < this.minPurchase)
    return {
      valid: false,
      message: `Minimum purchase of ₹${this.minPurchase} required for this coupon.`,
      discount: 0,
    };

  let discount =
    this.type === 'percentage' ? (subtotal * this.value) / 100 : this.value;
  if (this.type === 'percentage' && this.maxDiscount != null) {
    discount = Math.min(discount, this.maxDiscount);
  }
  discount = Math.min(discount, subtotal);
  return { valid: true, message: 'Coupon applied.', discount: Math.round(discount * 100) / 100 };
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
