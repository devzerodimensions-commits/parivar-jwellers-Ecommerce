import asyncHandler from '../middleware/asyncHandler.js';
import Coupon from '../models/Coupon.js';

// @route POST /api/coupons/validate  { code, subtotal }
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: (code || '').toUpperCase() });
  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code.');
  }
  const result = coupon.evaluate(Number(subtotal) || 0);
  if (!result.valid) {
    res.status(400);
    throw new Error(result.message);
  }
  res.json({
    success: true,
    discount: result.discount,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    message: result.message,
  });
});

// ---------- Admin ----------

// @route GET /api/coupons  (admin)
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, count: coupons.length, coupons });
});

// @route POST /api/coupons  (admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

// @route PUT /api/coupons/:id  (admin)
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found.');
  }
  res.json({ success: true, coupon });
});

// @route DELETE /api/coupons/:id  (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found.');
  }
  res.json({ success: true, message: 'Coupon removed.' });
});
