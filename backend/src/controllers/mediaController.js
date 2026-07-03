import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import asyncHandler from '../middleware/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS = path.resolve(path.join(__dirname, '..', '..', 'uploads'));

const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg)$/i;

// Root-relative URL (same origin), so media works on any domain.
const fileUrl = (req, rel) => `/uploads/${rel.split(path.sep).join('/')}`;

// Recursively collect image files under uploads/ (keeps the relative path).
const listImages = (dir, baseRel = '') => {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = baseRel ? `${baseRel}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listImages(full, rel));
    } else if (IMAGE_RE.test(entry.name)) {
      const stat = fs.statSync(full);
      out.push({ name: entry.name, rel, size: stat.size, modified: stat.mtimeMs });
    }
  }
  return out;
};

// @route GET /api/media  (admin) — list every image in the uploads folder
export const getMedia = asyncHandler(async (req, res) => {
  const files = listImages(UPLOADS)
    .sort((a, b) => b.modified - a.modified)
    .map((f) => ({
      name: f.name,
      path: f.rel,
      url: fileUrl(req, f.rel),
      size: f.size,
      folder: f.rel.includes('/') ? f.rel.split('/')[0] : 'uploads',
      modified: f.modified,
    }));
  res.json({ success: true, count: files.length, files });
});

// Resolve a relative path inside uploads, guarding against traversal. Returns null if invalid.
const safeTarget = (rel) => {
  if (!rel) return null;
  const target = path.resolve(UPLOADS, String(rel));
  if (target !== UPLOADS && !target.startsWith(UPLOADS + path.sep)) return null;
  return target;
};

// @route DELETE /api/media?path=<relative path>  (admin)
export const deleteMedia = asyncHandler(async (req, res) => {
  const target = safeTarget(req.query.path);
  if (!target) {
    res.status(400);
    throw new Error('Invalid or missing file path.');
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    res.status(404);
    throw new Error('File not found.');
  }
  fs.unlinkSync(target);
  res.json({ success: true, message: 'File deleted.' });
});

// @route POST /api/media/delete-many  { paths: [] }  (admin)
export const deleteManyMedia = asyncHandler(async (req, res) => {
  const paths = Array.isArray(req.body.paths) ? req.body.paths : [];
  if (!paths.length) {
    res.status(400);
    throw new Error('No files specified.');
  }
  let deleted = 0;
  for (const rel of paths) {
    const target = safeTarget(rel);
    if (target && fs.existsSync(target) && fs.statSync(target).isFile()) {
      fs.unlinkSync(target);
      deleted += 1;
    }
  }
  res.json({ success: true, deleted });
});

// @route POST /api/media/save  (admin) — save an edited image.
// multipart: `image` (the edited blob) + optional `path` to overwrite in place.
export const saveEditedMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image provided.');
  }
  let rel = (req.body.path || '').toString().trim();
  let target;
  if (rel) {
    target = safeTarget(rel);
    if (!target) {
      res.status(400);
      throw new Error('Invalid file path.');
    }
  } else {
    rel = `edited-${Date.now()}.png`;
    target = path.resolve(UPLOADS, rel);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, req.file.buffer);
  res.status(201).json({ success: true, url: fileUrl(req, rel), path: rel });
});
