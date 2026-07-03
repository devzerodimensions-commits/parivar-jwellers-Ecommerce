import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  subscribe,
  getSubscribers,
  deleteSubscriber,
} from '../controllers/subscriberController.js';

const router = Router();

router.post('/', subscribe);
router.get('/', protect, requireCap('users'), getSubscribers);
router.delete('/:id', protect, requireCap('users'), deleteSubscriber);

export default router;
