import asyncHandler from '../middleware/asyncHandler.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';

// @route GET /api/brands
export const getBrands = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const brands = await Brand.find(filter).sort('name');
  res.json({ success: true, count: brands.length, brands });
});

// @route POST /api/brands  (admin)
export const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  res.status(201).json({ success: true, brand });
});

// @route PUT /api/brands/:id  (admin)
export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found.');
  }
  Object.assign(brand, req.body);
  if (req.body.name) brand.markModified('name');
  await brand.save();
  res.json({ success: true, brand });
});

// @route DELETE /api/brands/:id  (admin)
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found.');
  }
  const inUse = await Product.countDocuments({ brand: brand._id });
  if (inUse > 0) {
    res.status(400);
    throw new Error(`Cannot delete: ${inUse} product(s) use this brand.`);
  }
  await brand.deleteOne();
  res.json({ success: true, message: 'Brand removed.' });
});
