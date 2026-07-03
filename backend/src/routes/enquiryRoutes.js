import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
} from '../controllers/enquiryController.js';

const router = Router();

router.post('/', createEnquiry); // public
router.get('/', protect, requireCap('enquiries'), getEnquiries);
router.put('/:id', protect, requireCap('enquiries'), updateEnquiry);
router.delete('/:id', protect, requireCap('enquiries'), deleteEnquiry);

export default router;
