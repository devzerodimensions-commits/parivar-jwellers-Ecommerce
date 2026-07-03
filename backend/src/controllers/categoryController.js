import asyncHandler from '../middleware/asyncHandler.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @route GET /api/categories  — public, with product counts
export const getCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  if (req.query.featured === 'true') filter.isFeatured = true;
  const categories = await Category.find(filter).sort('order name').lean();

  // Attach product counts.
  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  categories.forEach((c) => (c.productCount = countMap[String(c._id)] || 0));

  res.json({ success: true, count: categories.length, categories });
});

// @route GET /api/categories/:slug
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }
  res.json({ success: true, category });
});

// @route POST /api/categories  (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

// @route PUT /api/categories/:id  (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }
  Object.assign(category, req.body);
  if (req.body.name) category.markModified('name');
  await category.save();
  res.json({ success: true, category });
});

// @route DELETE /api/categories/:id  (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }
  const inUse = await Product.countDocuments({ category: category._id });
  if (inUse > 0) {
    res.status(400);
    throw new Error(`Cannot delete: ${inUse} product(s) use this category.`);
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category removed.' });
});
