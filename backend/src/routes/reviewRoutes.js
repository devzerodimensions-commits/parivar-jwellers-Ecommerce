import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  updateReview,
  deleteReview,
  getReviews,
  setReviewApproval,
} from '../controllers/reviewController.js';

const router = Router();

router.get('/', protect, requireCap('reviews'), getReviews);
router.put('/:id/approve', protect, requireCap('reviews'), setReviewApproval);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

export default router;
