import asyncHandler from '../middleware/asyncHandler.js';
import { storeImage } from '../utils/imageStore.js';

// @route POST /api/upload  (admin) — single image, field name "image"
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided.');
  }
  const url = await storeImage(req.file);
  res.status(201).json({ success: true, url });
});

// @route POST /api/upload/multiple  (admin) — field name "images"
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    res.status(400);
    throw new Error('No image files provided.');
  }
  const urls = await Promise.all(req.files.map(storeImage));
  res.status(201).json({ success: true, urls });
});
