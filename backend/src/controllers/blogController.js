import asyncHandler from '../middleware/asyncHandler.js';
import Blog from '../models/Blog.js';

// @route GET /api/blogs  — public, published only
export const getBlogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 9);
  const filter = req.query.all === 'true' ? {} : { isPublished: true };
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select('-content')
      .sort('-publishedAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Blog.countDocuments(filter),
  ]);
  res.json({ success: true, total, page, pages: Math.ceil(total / limit), blogs });
});

// @route GET /api/blogs/:slug
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!blog) {
    res.status(404);
    throw new Error('Article not found.');
  }
  res.json({ success: true, blog });
});

// ---------- Admin ----------

// @route POST /api/blogs  (admin)
export const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create(req.body);
  res.status(201).json({ success: true, blog });
});

// @route PUT /api/blogs/:id  (admin)
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Article not found.');
  }
  Object.assign(blog, req.body);
  if (req.body.title) blog.markModified('title');
  await blog.save();
  res.json({ success: true, blog });
});

// @route DELETE /api/blogs/:id  (admin)
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Article not found.');
  }
  res.json({ success: true, message: 'Article removed.' });
});
