import { v2 as cloudinary } from 'cloudinary';

// Persistent image storage. Render's local disk is wiped on every deploy, so any
// admin-uploaded image (banners, product photos, logo…) must live somewhere that
// survives redeploys. When CLOUDINARY_URL is set we store uploads on Cloudinary
// (free tier, fast CDN); otherwise we fall back to local disk (fine for local dev).
//
//   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
//
export const cloudinaryEnabled = Boolean(process.env.CLOUDINARY_URL);

if (cloudinaryEnabled) {
  // Credentials are auto-parsed from CLOUDINARY_URL; force https delivery URLs.
  cloudinary.config({ secure: true });
}

export const CLOUDINARY_FOLDER = 'parivar-jewellers';

// Stream a raw image buffer to Cloudinary and resolve with the upload result
// (result.secure_url is the public https URL, result.public_id is used for delete).
export const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });

export default cloudinary;
