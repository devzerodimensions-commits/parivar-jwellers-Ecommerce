import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

const resolveBrandIds = async (slugs) => {
  const brands = await Brand.find({ slug: { $in: slugs } }).select('_id');
  return brands.map((b) => b._id);
};

// Build a Mongo filter from storefront query params (category slug, brand, price, etc.).
const buildStoreFilter = async (query) => {
  const filter = { isActive: true };

  if (query.category) {
    const cat = await Category.findOne({ slug: query.category });
    if (cat) {
      // include direct child categories too
      const children = await Category.find({ parent: cat._id }).select('_id');
      filter.category = { $in: [cat._id, ...children.map((c) => c._id)] };
    } else {
      filter.category = null; // no match → empty result
    }
  }
  if (query.brand) {
    const brands = query.brand.split(',');
    filter.brand = { $in: await resolveBrandIds(brands) };
  }
  if (query.material) filter.material = { $in: query.material.split(',') };
  if (query.gender) filter.gender = { $in: query.gender.split(',') };
  if (query.purity) filter.purity = { $in: query.purity.split(',') };

  // Price range (matches against base price).
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.rating) filter.ratingAverage = { $gte: Number(query.rating) };

  if (query.featured === 'true') filter.isFeatured = true;
  if (query.newArrival === 'true') filter.isNewArrival = true;
  if (query.bestSeller === 'true') filter.isBestSeller = true;
  if (query.onSale === 'true') filter.salePrice = { $ne: null, $gt: 0 };

  if (query.search || query.q) {
    const term = query.search || query.q;
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { tags: { $regex: term, $options: 'i' } },
      { sku: { $regex: term, $options: 'i' } },
    ];
  }

  return filter;
};

const SORT_MAP = {
  newest: '-createdAt',
  oldest: 'createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
  popular: '-soldCount',
  rating: '-ratingAverage',
  name: 'name',
};

// @route GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const filter = await buildStoreFilter(req.query);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(60, parseInt(req.query.limit, 10) || 12);
  const skip = (page - 1) * limit;
  const sort = SORT_MAP[req.query.sort] || '-createdAt';

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    products,
  });
});

// @route GET /api/products/filters  — facet options for the shop sidebar
export const getFilterOptions = asyncHandler(async (req, res) => {
  const [materials, genders, purities, priceRange, brands] = await Promise.all([
    Product.distinct('material', { isActive: true }),
    Product.distinct('gender', { isActive: true }),
    Product.distinct('purity', { isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
    ]),
    Brand.find({ isActive: true }).select('name slug'),
  ]);

  res.json({
    success: true,
    filters: {
      materials: materials.filter(Boolean),
      genders: genders.filter(Boolean),
      purities: purities.filter(Boolean),
      brands,
      priceRange: priceRange[0] || { min: 0, max: 100000 },
    },
  });
});

// @route GET /api/products/featured
export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .limit(Number(req.query.limit) || 8)
    .sort('-createdAt');
  res.json({ success: true, products });
});

// @route GET /api/products/new-arrivals
export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(Number(req.query.limit) || 8);
  res.json({ success: true, products });
});

// @route GET /api/products/best-sellers
export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name slug')
    .sort('-soldCount -ratingAverage')
    .limit(Number(req.query.limit) || 8);
  res.json({ success: true, products });
});

// @route GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .populate('brand', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  // Related products from the same category.
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category?._id,
    isActive: true,
  })
    .limit(8)
    .select('name slug price salePrice images ratingAverage');

  res.json({ success: true, product, related });
});

// ---------- Admin ----------

// @route GET /api/products/admin/all  (admin) — includes inactive
export const getProductsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.status === 'low-stock') filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), products });
});

// @route GET /api/products/admin/:id  (admin) — full product for editing
export const getProductByIdAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('brand', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }
  res.json({ success: true, product });
});

// @route POST /api/products  (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @route PUT /api/products/:id  (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }
  Object.assign(product, req.body);
  // Re-run slug hook if the name changed.
  if (req.body.name) product.markModified('name');
  await product.save();
  res.json({ success: true, product });
});

// @route DELETE /api/products/:id  (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product removed.' });
});
