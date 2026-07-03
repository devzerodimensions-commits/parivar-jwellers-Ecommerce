import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  getBanners,
  getBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';

const router = Router();

router.get('/', getBanners);
router.get('/admin', protect, requireCap('banners'), getBannersAdmin);
router.post('/', protect, requireCap('banners'), createBanner);
router.route('/:id').put(protect, requireCap('banners'), updateBanner).delete(protect, requireCap('banners'), deleteBanner);

export default router;
