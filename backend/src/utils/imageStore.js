import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { cloudinaryEnabled, uploadBufferToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// Oversized uploads are scaled down; webp output stays small and crisp.
const MAX_WIDTH = 1920;

const isSvg = (file) => /svg/i.test(file.mimetype || '') || /\.svg$/i.test(file.originalname || '');

const slug = (name) =>
  (path.basename(name || 'image', path.extname(name || '')) || 'image')
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .slice(0, 40) || 'image';

// Convert any raster image to a resized webp buffer. SVG is left as-is (vector).
const toWebp = async (file) => {
  if (isSvg(file)) return { buffer: file.buffer, ext: 'svg' };
  const buffer = await sharp(file.buffer, { animated: true })
    .rotate() // honour EXIF orientation (phone photos)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { buffer, ext: 'webp' };
};

// Store an uploaded (in-memory) image and return its public URL. Every image is
// converted to webp first; then stored on Cloudinary (persistent) when configured,
// otherwise written to the local uploads/ folder (development / fallback).
export const storeImage = async (file) => {
  const { buffer, ext } = await toWebp(file);
  if (cloudinaryEnabled) {
    const result = await uploadBufferToCloudinary(buffer);
    return result.secure_url;
  }
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `${slug(file.originalname)}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
};

export default storeImage;
