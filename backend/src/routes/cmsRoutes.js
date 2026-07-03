import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
} from '../controllers/cmsController.js';

const router = Router();

router.get('/', getPages);
router.post('/', protect, requireCap('pages'), createPage);
router.get('/:slug', getPageBySlug);
router.route('/:id').put(protect, requireCap('pages'), updatePage).delete(protect, requireCap('pages'), deletePage);

export default router;
