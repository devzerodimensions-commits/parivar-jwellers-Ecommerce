import { useEffect, useRef, useState } from 'react';
import { FaUpload, FaSearch, FaTimes, FaImage, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../ui/Spinner.jsx';
import EmptyState from '../ui/EmptyState.jsx';

/**
 * WordPress-style media picker modal. Browse the existing media library or upload
 * new images, select one (or many), then Insert. Calls onSelect(url | url[]).
 * Admin-only (uses the /media endpoints).
 */
const MediaLibrary = ({ multiple = false, onSelect, onClose }) => {
  const inputRef = useRef();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState([]); // selected urls

  const load = () => {
    setLoading(true);
    api
      .get('/media')
      .then((r) => setFiles(r.data.files))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const togglePick = (url) =>
    setPicked((prev) => {
      if (multiple) return prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url];
      return prev.includes(url) ? [] : [url];
    });

  const handleUpload = async (fileList) => {
    if (!fileList.length) return;
    setUploading(true);
    try {
      const data = new FormData();
      Array.from(fileList).forEach((f) => data.append('images', f));
      const res = await api.post('/media/multiple', data);
      const newUrls = res.data.urls || [];
      toast.success(`Uploaded ${newUrls.length} image(s)`);
      setPicked((prev) => (multiple ? [...prev, ...newUrls] : newUrls.slice(-1)));
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const insert = (urls) => {
    if (!urls.length) return;
    onSelect(multiple ? urls : urls[0]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-3">
          <h3 className="font-serif text-xl font-bold">Media Library</h3>
          <button type="button" onClick={onClose} className="text-charcoal/50 hover:text-charcoal">
            <FaTimes />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-charcoal/10 px-5 py-3">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary">
            <FaUpload /> {uploading ? 'Uploading…' : 'Upload New'}
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
          <div className="relative ml-auto w-full max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media…"
              className="input pr-9"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FaImage />}
              title={search ? 'No matching media' : 'No media yet'}
              message={search ? 'Try a different search.' : 'Click “Upload New” to add your first image.'}
            />
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {filtered.map((f) => {
                const on = picked.includes(f.url);
                return (
                  <button
                    type="button"
                    key={f.path}
                    onClick={() => togglePick(f.url)}
                    onDoubleClick={() => insert([f.url])}
                    title={`${f.name} — double-click to insert`}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-cream transition ${
                      on ? 'border-gold-500 ring-2 ring-gold-300' : 'border-transparent hover:border-gold-300'
                    }`}
                  >
                    <img src={f.url} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                    {on && (
                      <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-gold-500 text-white">
                        <FaCheck size={10} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-charcoal/10 px-5 py-3">
          <span className="text-sm text-charcoal/50">
            {picked.length ? `${picked.length} selected` : 'Select an image'}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn border border-charcoal/20 hover:bg-charcoal/5">
              Cancel
            </button>
            <button type="button" onClick={() => insert(picked)} disabled={!picked.length} className="btn-primary disabled:opacity-40">
              Insert{multiple && picked.length ? ` (${picked.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
