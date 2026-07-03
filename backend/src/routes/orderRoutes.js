import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  getOrders,
  updateOrderStatus,
  markOrderPaid,
} from '../controllers/orderController.js';

const router = Router();

// Public order tracking by order number (+ email).
router.get('/track/:orderNumber', trackOrder);

router.use(protect);

router.post('/', createOrder);
router.get('/mine', getMyOrders);

// Admin list (registered before /:id).
router.get('/', requireCap('orders'), getOrders);

router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', requireCap('orders'), updateOrderStatus);
router.put('/:id/pay', requireCap('orders'), markOrderPaid);

export default router;
