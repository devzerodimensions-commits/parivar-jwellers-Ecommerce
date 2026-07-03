import { Router } from 'express';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadImage, uploadImages } from '../controllers/uploadController.js';

const router = Router();

router.post('/', protect, admin, upload.single('image'), uploadImage);
router.post('/multiple', protect, admin, upload.array('images', 8), uploadImages);

export default router;
