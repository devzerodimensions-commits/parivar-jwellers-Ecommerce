import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { FaTimes, FaSyncAlt, FaCheck, FaSearchPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { getCroppedBlob, toEditableSrc } from '../../utils/cropImage.js';

const ASPECTS = [
  { label: 'Original', value: 'original' },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:1', value: 3 },
];

/**
 * Reusable crop / resize / replace image editor (modal).
 *
 * Props:
 *  - src: current image URL
 *  - title: modal heading
 *  - initialAspect: 'original' | number  (e.g. 1 for favicon)
 *  - overwritePath: optional uploads-relative path to overwrite in place
 *  - round: render the preview as a circle (favicon)
 *  - onClose(), onSaved({ url, path })
 */
const ImageEditor = ({
  src,
  title = 'Edit Image',
  initialAspect = 'original',
  overwritePath,
  round = false,
  onClose,
  onSaved,
}) => {
  const replaceRef = useRef();
  const [workingSrc, setWorkingSrc] = useState(src);
  const editSrc = toEditableSrc(workingSrc);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectKey, setAspectKey] = useState(initialAspect);
  const [naturalAspect, setNaturalAspect] = useState(1);
  const [cropPixels, setCropPixels] = useState(null);
  const [outWidth, setOutWidth] = useState('');
  const [touchedDims, setTouchedDims] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const aspect = aspectKey === 'original' ? naturalAspect : Number(aspectKey);
  const cropAspect = cropPixels ? cropPixels.width / cropPixels.height : 1;
  const outHeight =
    cropPixels && outWidth ? Math.round(Number(outWidth) / cropAspect) : '';

  const onMediaLoaded = useCallback((mediaSize) => {
    setNaturalAspect(mediaSize.naturalWidth / mediaSize.naturalHeight);
  }, []);

  const onCropComplete = useCallback(
    (_area, areaPixels) => {
      setCropPixels(areaPixels);
      if (!touchedDims) setOutWidth(Math.round(areaPixels.width));
    },
    [touchedDims]
  );

  // Live preview (regenerated whenever the crop settles).
  useEffect(() => {
    if (!cropPixels) return;
    let url;
    let cancelled = false;
    const pw = Math.min(260, cropPixels.width);
    const ph = Math.round(pw / cropAspect);
    getCroppedBlob(editSrc, cropPixels, pw, ph)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreview(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [cropPixels, editSrc, cropAspect]);

  const replace = (file) => {
    if (!file) return;
    setWorkingSrc(URL.createObjectURL(file));
    setTouchedDims(false);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const save = async () => {
    if (!cropPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(
        editSrc,
        cropPixels,
        Number(outWidth) || cropPixels.width,
        Number(outHeight) || cropPixels.height
      );
      const data = new FormData();
      data.append('image', blob, 'edited.png');
      if (overwritePath) data.append('path', overwritePath);
      const res = await api.post('/media/save', data);
      toast.success('Image saved');
      onSaved?.(res.data);
    } catch (err) {
      toast.error(err.message || 'Could not save image');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-3">
          <h3 className="font-serif text-lg">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-charcoal/60 hover:text-charcoal">
            <FaTimes />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5 md:grid-cols-[1fr_240px]">
          {/* Cropper */}
          <div>
            <div className="relative h-72 w-full overflow-hidden rounded-lg bg-charcoal sm:h-96">
              <Cropper
                image={editSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect || 1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                onMediaLoaded={onMediaLoaded}
                cropShape={round ? 'round' : 'rect'}
                zoomWithScroll
              />
            </div>

            {/* Zoom */}
            <div className="mt-3 flex items-center gap-3">
              <FaSearchPlus className="text-charcoal/50" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-gold-600"
              />
            </div>

            {/* Aspect presets */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="self-center text-xs text-charcoal/50">Crop ratio:</span>
              {ASPECTS.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => setAspectKey(a.value)}
                  className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                    String(aspectKey) === String(a.value)
                      ? 'border-gold-600 bg-gold-50 text-gold-800'
                      : 'border-charcoal/15 hover:border-gold-400'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Side panel: preview + resize + replace */}
          <div className="space-y-4">
            <div>
              <p className="label">Preview</p>
              <div className="grid h-32 place-items-center rounded-lg border border-charcoal/10 bg-cream p-2">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className={`max-h-full max-w-full object-contain ${round ? 'rounded-full' : ''}`}
                  />
                ) : (
                  <span className="text-xs text-charcoal/40">Adjust the crop…</span>
                )}
              </div>
            </div>

            <div>
              <label className="label">Output width (px)</label>
              <input
                type="number"
                min="1"
                className="input"
                value={outWidth}
                onChange={(e) => {
                  setTouchedDims(true);
                  setOutWidth(e.target.value);
                }}
              />
              <p className="mt-1 text-xs text-charcoal/40">
                Height: {outHeight || '—'} px · keeps the crop ratio
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => replaceRef.current?.click()}
                className="btn-outline w-full"
              >
                <FaSyncAlt /> Replace image
              </button>
              <input
                ref={replaceRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => replace(e.target.files?.[0])}
              />
              <p className="mt-1 text-xs text-charcoal/40">Load a different image to edit.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-charcoal/10 px-5 py-3">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving || !cropPixels} className="btn-primary">
            <FaCheck /> {saving ? 'Saving…' : 'Save Image'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
