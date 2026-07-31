import asyncHandler from '../middleware/asyncHandler.js';
import { cloudinaryEnabled, uploadBufferToCloudinary } from '../config/cloudinary.js';

// Turn a multer file into a public URL. With Cloudinary the file is in memory —
// stream it up and use the returned https URL. On local disk, serve /uploads/<name>.
const toUrl = async (file) => {
  if (cloudinaryEnabled) {
    const result = await uploadBufferToCloudinary(file.buffer);
    return result.secure_url;
  }
  return `/uploads/${file.filename}`;
};

// @route POST /api/upload  (admin) — single image, field name "image"
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided.');
  }
  const url = await toUrl(req.file);
  res.status(201).json({ success: true, url });
});

// @route POST /api/upload/multiple  (admin) — field name "images"
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    res.status(400);
    throw new Error('No image files provided.');
  }
  const urls = await Promise.all(req.files.map(toUrl));
  res.status(201).json({ success: true, urls });
});
