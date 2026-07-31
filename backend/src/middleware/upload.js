import path from 'path';
import multer from 'multer';

const allowed = /jpeg|jpg|png|webp|gif|svg/;
const fileFilter = (req, file, cb) => {
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Only image files (jpg, png, webp, gif, svg) are allowed.'));
};

// Keep uploads in memory; the controller (storeImage) converts each image to webp
// and stores it on Cloudinary (persistent) or the local uploads/ folder.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB source (webp output is far smaller)
});

export default upload;
