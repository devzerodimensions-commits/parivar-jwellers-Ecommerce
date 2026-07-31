import { Router } from 'express';

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import brandRoutes from './brandRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import couponRoutes from './couponRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import blogRoutes from './blogRoutes.js';
import cmsRoutes from './cmsRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import subscriberRoutes from './subscriberRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import { getGoldPrice } from '../controllers/goldController.js';
import asyncHandler from '../middleware/asyncHandler.js';
import cloudinaryClient, { cloudinaryEnabled } from '../config/cloudinary.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/banners', bannerRoutes);
router.use('/blogs', blogRoutes);
router.use('/pages', cmsRoutes);
router.use('/settings', settingsRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/upload', uploadRoutes);
router.use('/media', mediaRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/dashboard', dashboardRoutes);
router.get('/gold-price', getGoldPrice);

// TEMP diagnostic for Cloudinary setup — safe (no secrets, only booleans + prefix).
router.get('/cloudinary-status', asyncHandler(async (req, res) => {
  const c = cloudinaryClient.config();
  const info = {
    enabled: cloudinaryEnabled,
    cloudName: c.cloud_name || null,
    hasKey: !!c.api_key,
    hasSecret: !!c.api_secret,
    startsWith: (process.env.CLOUDINARY_URL || '').slice(0, 13),
    length: (process.env.CLOUDINARY_URL || '').length,
  };
  try {
    const ping = await cloudinaryClient.api.ping();
    info.ping = ping.status || 'ok';
  } catch (e) {
    info.pingError = e?.error?.message || e?.message || String(e);
  }
  res.json(info);
}));

export default router;
