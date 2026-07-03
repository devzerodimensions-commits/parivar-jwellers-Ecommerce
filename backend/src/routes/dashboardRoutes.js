import { Router } from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', protect, admin, getDashboardStats);

export default router;
