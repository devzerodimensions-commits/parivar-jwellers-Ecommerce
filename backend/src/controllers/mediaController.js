import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import asyncHandler from '../middleware/asyncHandler.js';
import cloudinary, { cloudinaryEnabled, CLOUDINARY_FOLDER } from '../config/cloudinary.js';
import { storeImage } from '../utils/imageStore.js';

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

// A path belongs to Cloudinary (vs the local disk) when it's inside our folder.
const isCloudinaryPath = (p) => cloudinaryEnabled && String(p).startsWith(`${CLOUDINARY_FOLDER}/`);

// @route GET /api/media  (admin) — every image: local committed files + Cloudinary uploads
export const getMedia = asyncHandler(async (req, res) => {
  // Local committed images (logo, hero banners, seed art) — always shown.
  const files = listImages(UPLOADS).map((f) => ({
    name: f.name,
    path: f.rel,
    url: fileUrl(req, f.rel),
    size: f.size,
    folder: f.rel.includes('/') ? f.rel.split('/')[0] : 'uploads',
    modified: f.modified,
  }));

  // Cloudinary uploads (persistent) when configured.
  if (cloudinaryEnabled) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: `${CLOUDINARY_FOLDER}/`,
        max_results: 200,
      });
      for (const r of result.resources || []) {
        files.push({
          name: `${r.public_id.split('/').pop()}.${r.format}`,
          path: r.public_id,
          url: r.secure_url,
          size: r.bytes,
          folder: 'cloudinary',
          modified: new Date(r.created_at).getTime(),
        });
      }
    } catch {
      /* if the Cloudinary listing fails, still return local images */
    }
  }

  files.sort((a, b) => b.modified - a.modified);
  res.json({ success: true, count: files.length, files });
});

// Resolve a relative path inside uploads, guarding against traversal. Returns null if invalid.
const safeTarget = (rel) => {
  if (!rel) return null;
  const target = path.resolve(UPLOADS, String(rel));
  if (target !== UPLOADS && !target.startsWith(UPLOADS + path.sep)) return null;
  return target;
};

// @route DELETE /api/media?path=<local rel path | cloudinary public_id>  (admin)
export const deleteMedia = asyncHandler(async (req, res) => {
  const p = req.query.path;
  if (!p) {
    res.status(400);
    throw new Error('Invalid or missing file path.');
  }

  if (isCloudinaryPath(p)) {
    await cloudinary.uploader.destroy(String(p));
    return res.json({ success: true, message: 'File deleted.' });
  }

  const target = safeTarget(p);
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
  for (const p of paths) {
    try {
      if (isCloudinaryPath(p)) {
        await cloudinary.uploader.destroy(String(p));
        deleted += 1;
      } else {
        const target = safeTarget(p);
        if (target && fs.existsSync(target) && fs.statSync(target).isFile()) {
          fs.unlinkSync(target);
          deleted += 1;
        }
      }
    } catch {
      /* skip failures */
    }
  }
  res.json({ success: true, deleted });
});

// @route POST /api/media/save  (admin) — save an edited image (as a new webp).
export const saveEditedMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image provided.');
  }
  const url = await storeImage(req.file);
  res.status(201).json({ success: true, url });
});
