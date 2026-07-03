import asyncHandler from '../middleware/asyncHandler.js';
import Banner from '../models/Banner.js';

// @route GET /api/banners  — public, only active & in-window
export const getBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const filter = {
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  };
  if (req.query.position) filter.position = req.query.position;
  const banners = await Banner.find(filter).sort('order');
  res.json({ success: true, banners });
});

// @route GET /api/banners/admin  (admin) — all banners
export const getBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('position order');
  res.json({ success: true, banners });
});

// @route POST /api/banners  (admin)
export const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
});

// @route PUT /api/banners/:id  (admin)
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found.');
  }
  res.json({ success: true, banner });
});

// @route DELETE /api/banners/:id  (admin)
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found.');
  }
  res.json({ success: true, message: 'Banner removed.' });
});
