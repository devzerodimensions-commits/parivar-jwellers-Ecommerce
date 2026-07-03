import asyncHandler from '../middleware/asyncHandler.js';
import CmsPage from '../models/CmsPage.js';

// @route GET /api/pages  — list published pages (slug + title)
export const getPages = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isPublished: true };
  const pages = await CmsPage.find(filter).select('title slug type isPublished').sort('title');
  res.json({ success: true, pages });
});

// @route GET /api/pages/:slug
export const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await CmsPage.findOne({ slug: req.params.slug });
  if (!page || (!page.isPublished && req.query.preview !== 'true')) {
    res.status(404);
    throw new Error('Page not found.');
  }
  res.json({ success: true, page });
});

// ---------- Admin ----------

// @route POST /api/pages  (admin)
export const createPage = asyncHandler(async (req, res) => {
  const page = await CmsPage.create(req.body);
  res.status(201).json({ success: true, page });
});

// @route PUT /api/pages/:id  (admin)
export const updatePage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error('Page not found.');
  }
  Object.assign(page, req.body);
  if (req.body.title) page.markModified('title');
  await page.save();
  res.json({ success: true, page });
});

// @route DELETE /api/pages/:id  (admin)
export const deletePage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findByIdAndDelete(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error('Page not found.');
  }
  res.json({ success: true, message: 'Page removed.' });
});
