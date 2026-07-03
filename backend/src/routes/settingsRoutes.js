import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import {
  getSettings,
  getSettingsAdmin,
  updateSettings,
} from '../controllers/settingsController.js';

const router = Router();

router.get('/', getSettings);
router.get('/admin', protect, requireCap('settings'), getSettingsAdmin);
router.put('/', protect, requireCap('settings'), updateSettings);

export default router;
