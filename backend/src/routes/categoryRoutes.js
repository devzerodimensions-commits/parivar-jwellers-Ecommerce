import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, requireCap('catalog'), createCategory);
router.get('/:slug', getCategoryBySlug);
router.route('/:id').put(protect, requireCap('catalog'), updateCategory).delete(protect, requireCap('catalog'), deleteCategory);

export default router;
