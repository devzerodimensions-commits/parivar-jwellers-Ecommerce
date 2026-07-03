import { Router } from 'express';
import multer from 'multer';
import { protect, requireCap } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getMedia,
  deleteMedia,
  deleteManyMedia,
  saveEditedMedia,
} from '../controllers/mediaController.js';
import { uploadImage, uploadImages } from '../controllers/uploadController.js';

const router = Router();

// In-memory upload for edited blobs (we write them to a chosen path ourselves).
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.get('/', protect, requireCap('media'), getMedia);
router.post('/', protect, requireCap('media'), upload.single('image'), uploadImage);
router.post('/multiple', protect, requireCap('media'), upload.array('images', 12), uploadImages);
router.post('/save', protect, requireCap('media'), memoryUpload.single('image'), saveEditedMedia);
router.post('/delete-many', protect, requireCap('media'), deleteManyMedia);
router.delete('/', protect, requireCap('media'), deleteMedia);

export default router;
