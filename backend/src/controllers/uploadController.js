import asyncHandler from '../middleware/asyncHandler.js';

// Root-relative URL for an uploaded file, so it works on any domain
// (localhost, tunnel, or a deployed host) served from the same origin.
const fileUrl = (req, filename) => `/uploads/${filename}`;

// @route POST /api/upload  (admin) — single image, field name "image"
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided.');
  }
  res.status(201).json({ success: true, url: fileUrl(req, req.file.filename) });
});

// @route POST /api/upload/multiple  (admin) — field name "images"
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    res.status(400);
    throw new Error('No image files provided.');
  }
  res.status(201).json({
    success: true,
    urls: req.files.map((f) => fileUrl(req, f.filename)),
  });
});
