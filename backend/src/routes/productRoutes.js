import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  getProducts,
  getFilterOptions,
  getFeatured,
  getNewArrivals,
  getBestSellers,
  getProductBySlug,
  getProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { getProductReviews, createReview } from '../controllers/reviewController.js';

const router = Router();

// Specific routes before the :slug catch-all.
router.get('/', getProducts);
router.get('/filters', getFilterOptions);
router.get('/featured', getFeatured);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/admin/all', protect, requireCap('catalog'), getProductsAdmin);
router.get('/admin/:id', protect, requireCap('catalog'), getProductByIdAdmin);

router.post('/', protect, requireCap('catalog'), createProduct);
router.route('/:id').put(protect, requireCap('catalog'), updateProduct).delete(protect, requireCap('catalog'), deleteProduct);

// Reviews nested under a product.
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, createReview);

// Public product detail by slug (keep last).
router.get('/:slug', getProductBySlug);

export default router;
