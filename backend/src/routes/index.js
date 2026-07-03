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

export default router;
