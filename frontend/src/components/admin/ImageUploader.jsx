import { useRef, useState } from 'react';
import { FaUpload, FaTimes, FaImages } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import MediaLibrary from './MediaLibrary.jsx';

/**
 * Manage a single image url or a list of urls.
 * `value` is an array of urls (multiple) or a single url string (single).
 *
 * By default the "add" button opens the WordPress-style Media Library modal
 * (browse existing images or upload new). Pass `library={false}` to fall back to
 * a plain file picker (used on customer-facing pages that can't access /media).
 */
const ImageUploader = ({ value, onChange, multiple = false, endpoint = '/upload', library = true }) => {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // Media Library selection.
  const onPick = (sel) => {
    if (multiple) onChange([...(value || []), ...(Array.isArray(sel) ? sel : [sel])]);
    else onChange(Array.isArray(sel) ? sel[0] : sel);
  };

  const openAdd = () => {
    if (library) setPickerOpen(true);
    else inputRef.current?.click();
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
            onClick={openAdd}
            disabled={uploading}
            className="grid h-24 w-24 place-items-center rounded-md border-2 border-dashed border-charcoal/20 text-charcoal/40 hover:border-gold-400 hover:text-gold-600"
          >
            {uploading ? '…' : library ? <FaImages size={20} /> : <FaUpload />}
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
        {library
          ? 'Choose from the Media Library or upload new. JPG/PNG/WebP/GIF — auto-optimised to webp.'
          : 'PNG/JPG/WebP up to 10 MB.'}
      </p>

      {pickerOpen && (
        <MediaLibrary multiple={multiple} onSelect={onPick} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
};

export default ImageUploader;
