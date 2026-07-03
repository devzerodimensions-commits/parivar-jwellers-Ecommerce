import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';

const router = Router();

router.get('/', getBrands);
router.post('/', protect, requireCap('catalog'), createBrand);
router.route('/:id').put(protect, requireCap('catalog'), updateBrand).delete(protect, requireCap('catalog'), deleteBrand);

export default router;
