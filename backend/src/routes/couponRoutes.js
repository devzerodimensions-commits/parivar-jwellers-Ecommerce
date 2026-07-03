import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', protect, requireCap('coupons'), getCoupons);
router.post('/', protect, requireCap('coupons'), createCoupon);
router.route('/:id').put(protect, requireCap('coupons'), updateCoupon).delete(protect, requireCap('coupons'), deleteCoupon);

export default router;
