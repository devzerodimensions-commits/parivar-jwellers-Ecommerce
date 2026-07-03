import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';

const router = Router();

router.get('/', getBlogs);
router.post('/', protect, requireCap('blog'), createBlog);
router.get('/:slug', getBlogBySlug);
router.route('/:id').put(protect, requireCap('blog'), updateBlog).delete(protect, requireCap('blog'), deleteBlog);

export default router;
