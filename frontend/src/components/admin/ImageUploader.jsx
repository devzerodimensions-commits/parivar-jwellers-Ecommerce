import { useRef, useState } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';

/**
 * Upload one or more images to the API and manage a list of URLs.
 * `value` is an array of urls (multiple) or a single url string (single).
 */
const ImageUploader = ({ value, onChange, multiple = false, endpoint = '/upload' }) => {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const urls = multiple ? value || [] : value ? [value] : [];

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      if (multiple) {
        const data = new FormData();
        Array.from(files).forEach((f) => data.append('images', f));
        const res = await api.post(`${endpoint}/multiple`, data);
        onChange([...(value || []), ...res.data.urls]);
      } else {
        const data = new FormData();
        data.append('image', files[0]);
        const res = await api.post(endpoint, data);
        onChange(res.data.url);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (i) => {
    if (multiple) onChange(value.filter((_, idx) => idx !== i));
    else onChange('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-md border border-charcoal/15">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
            >
              <FaTimes size={10} />
            </button>
          </div>
        ))}

        {(multiple || urls.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="grid h-24 w-24 place-items-center rounded-md border-2 border-dashed border-charcoal/20 text-charcoal/40 hover:border-gold-400 hover:text-gold-600"
          >
            {uploading ? '…' : <FaUpload />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-charcoal/40">
        Or paste an image URL below. PNG/JPG/WebP up to 5&nbsp;MB.
      </p>
    </div>
  );
};

export default ImageUploader;
