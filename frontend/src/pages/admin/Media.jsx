import { useEffect, useRef, useState } from 'react';
import { FaUpload, FaTrash, FaCopy, FaPen, FaSearch, FaImage, FaCheckSquare } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ImageEditor from '../../components/admin/ImageEditor.jsx';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const Media = () => {
  const inputRef = useRef();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null); // file being edited
  const [deletingBulk, setDeletingBulk] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/media')
      .then((res) => setFiles(res.data.files))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  // ---- Selection ----
  const toggleSelect = (path) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  const clearSelection = () => setSelected(new Set());
  const selectAllFiltered = () => setSelected(new Set(filtered.map((f) => f.path)));

  // ---- Upload ----
  const handleUpload = async (fileList) => {
    if (!fileList.length) return;
    setUploading(true);
    try {
      const data = new FormData();
      Array.from(fileList).forEach((f) => data.append('images', f));
      const res = await api.post('/media/multiple', data);
      toast.success(`Uploaded ${res.data.urls.length} file(s)`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  // ---- Delete ----
  const remove = async (file) => {
    if (!window.confirm(`Delete "${file.name}"? If a product or banner uses it, the image will break.`)) return;
    try {
      await api.delete(`/media?path=${encodeURIComponent(file.path)}`);
      toast.success('Deleted');
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(file.path);
        return next;
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const bulkDelete = async () => {
    const paths = [...selected];
    if (!paths.length) return;
    if (!window.confirm(`Delete ${paths.length} selected image(s)? This cannot be undone.`)) return;
    setDeletingBulk(true);
    try {
      const res = await api.post('/media/delete-many', { paths });
      toast.success(`Deleted ${res.data.deleted} image(s)`);
      setFiles((prev) => prev.filter((f) => !selected.has(f.path)));
      clearSelection();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingBulk(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">
          Media Library <span className="text-base font-normal text-charcoal/40">({files.length})</span>
        </h1>
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary">
          <FaUpload /> {uploading ? 'Uploading…' : 'Upload Media'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media by name…"
          className="input pr-10"
        />
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-16 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gold-300 bg-gold-50 px-4 py-2.5 shadow-sm">
          <FaCheckSquare className="text-gold-600" />
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button onClick={selectAllFiltered} className="text-xs text-gold-700 hover:underline">
            Select all ({filtered.length})
          </button>
          <button onClick={clearSelection} className="text-xs text-charcoal/60 hover:underline">
            Clear
          </button>
          <button
            onClick={bulkDelete}
            disabled={deletingBulk}
            className="btn ml-auto bg-red-600 text-white hover:bg-red-700"
          >
            <FaTrash /> {deletingBulk ? 'Deleting…' : `Delete Selected (${selected.size})`}
          </button>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FaImage />}
          title={search ? 'No matching media' : 'No media yet'}
          message={search ? 'Try a different search.' : 'Upload images to build your media library.'}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {filtered.map((f) => {
            const isSelected = selected.has(f.path);
            return (
              <div
                key={f.path}
                className={`group card overflow-hidden ${isSelected ? 'ring-2 ring-gold-500' : ''}`}
              >
                <div className="relative aspect-square bg-cream">
                  {/* Selection checkbox */}
                  <label
                    className={`absolute left-2 top-2 z-10 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } transition-opacity`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(f.path)}
                      className="h-4 w-4 cursor-pointer rounded border-charcoal/30 text-gold-600 focus:ring-gold-500"
                    />
                  </label>

                  {/* Image — click to edit */}
                  <button
                    type="button"
                    onClick={() => setEditing(f)}
                    title="Click to edit"
                    className="block h-full w-full"
                  >
                    <img src={f.url} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                  </button>

                  {/* Hover actions */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/55 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <ActionBtn title="Edit" onClick={() => setEditing(f)}>
                      <FaPen size={11} />
                    </ActionBtn>
                    <ActionBtn title="Copy URL" onClick={() => copyUrl(f.url)}>
                      <FaCopy size={12} />
                    </ActionBtn>
                    <ActionBtn title="Delete" danger onClick={() => remove(f)}>
                      <FaTrash size={11} />
                    </ActionBtn>
                  </div>

                  {f.folder !== 'uploads' && (
                    <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {f.folder}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-charcoal" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-[11px] text-charcoal/40">{formatSize(f.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image editor modal */}
      {editing && (
        <ImageEditor
          src={editing.url}
          title={`Edit — ${editing.name}`}
          initialAspect="original"
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
};

const ActionBtn = ({ children, onClick, title, danger }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white shadow ${
      danger ? 'text-red-600 hover:bg-red-50' : 'text-charcoal hover:text-gold-700'
    }`}
  >
    {children}
  </button>
);

export default Media;
