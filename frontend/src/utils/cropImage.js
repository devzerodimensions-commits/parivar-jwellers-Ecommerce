/**
 * Crop (and optionally resize) an image to a PNG Blob using a canvas.
 *
 * @param {string} src         image source (same-origin so the canvas isn't tainted)
 * @param {{x,y,width,height}} cropPixels  crop rectangle in source pixels
 * @param {number} [outWidth]  output width  (defaults to crop width)
 * @param {number} [outHeight] output height (defaults to crop height)
 * @returns {Promise<Blob>}
 */
export const getCroppedBlob = (src, cropPixels, outWidth, outHeight) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const w = Math.max(1, Math.round(outWidth || cropPixels.width));
        const h = Math.max(1, Math.round(outHeight || cropPixels.height));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          image,
          cropPixels.x,
          cropPixels.y,
          cropPixels.width,
          cropPixels.height,
          0,
          0,
          w,
          h
        );
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Could not export image'))),
          'image/png'
        );
      } catch (err) {
        reject(err);
      }
    };
    image.onerror = () => reject(new Error('Could not load image for editing'));
    image.src = src;
  });

/**
 * Convert a stored absolute image URL to a same-origin path so the canvas can
 * read its pixels (avoids cross-origin tainting). Leaves blob:/data: URLs as-is.
 * In dev, "/uploads/..." is proxied to the API by Vite.
 */
export const toEditableSrc = (url) => {
  if (!url) return url;
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname + u.search;
  } catch {
    return url;
  }
};
