import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Blog from '../models/Blog.js';
import CmsPage from '../models/CmsPage.js';

// @route GET /sitemap.xml — dynamic sitemap from live content
export const sitemap = asyncHandler(async (req, res) => {
  const base = process.env.CLIENT_URL || 'http://localhost:5173';

  const [products, categories, blogs, pages] = await Promise.all([
    Product.find({ isActive: true }).select('slug updatedAt'),
    Category.find({ isActive: true }).select('slug updatedAt'),
    Blog.find({ isPublished: true }).select('slug updatedAt'),
    CmsPage.find({ isPublished: true }).select('slug updatedAt'),
  ]);

  const urls = [
    { loc: `${base}/`, priority: '1.0' },
    { loc: `${base}/shop`, priority: '0.9' },
    { loc: `${base}/blog`, priority: '0.6' },
    ...categories.map((c) => ({ loc: `${base}/category/${c.slug}`, lastmod: c.updatedAt, priority: '0.8' })),
    ...products.map((p) => ({ loc: `${base}/product/${p.slug}`, lastmod: p.updatedAt, priority: '0.7' })),
    ...blogs.map((b) => ({ loc: `${base}/blog/${b.slug}`, lastmod: b.updatedAt, priority: '0.5' })),
    ...pages.map((p) => ({ loc: `${base}/page/${p.slug}`, lastmod: p.updatedAt, priority: '0.4' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// @route GET /robots.txt
export const robots = (req, res) => {
  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /account
Disallow: /checkout
Disallow: /cart
Disallow: /admin

Sitemap: ${base}/sitemap.xml
`);
};
