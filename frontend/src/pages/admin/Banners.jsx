import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const blank = {
  title: '',
  subtitle: '',
  image: '',
  link: '',
  buttonText: '',
  position: 'hero',
  order: 0,
  isActive: true,
};

const Banners = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);

  const load = () =>
    api
      .get('/banners/admin')
      .then((res) => setItems(res.data.banners))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.image) return toast.error('A banner image is required.');
    try {
      if (editId) await api.put(`/banners/${editId}`, form);
      else await api.post('/banners', form);
      toast.success(editId ? 'Banner updated.' : 'Banner created.');
      setForm(blank);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const edit = (b) => {
    setEditId(b._id);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link || '',
      buttonText: b.buttonText || '',
      position: b.position,
      order: b.order || 0,
      isActive: b.isActive,
    });
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-bold">Banners</h1>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-3 p-6">
          <h3 className="font-serif text-lg">{editId ? 'Edit Banner' : 'Add Banner'}</h3>
          <div>
            <label className="label">Image</label>
            <ImageUploader value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
            <input className="input mt-2" placeholder="…or image URL" value={form.image} onChange={set('image')} />
          </div>
          <Field label="Title" value={form.title} onChange={set('title')} />
          <Field label="Subtitle" value={form.subtitle} onChange={set('subtitle')} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button text" value={form.buttonText} onChange={set('buttonText')} />
            <Field label="Link" value={form.link} onChange={set('link')} placeholder="/category/gold-jewellery" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Position</label>
              <select className="input" value={form.position} onChange={set('position')}>
                <option value="hero">Hero</option>
                <option value="promo">Promo</option>
                <option value="secondary">Secondary</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
            <Field label="Order" type="number" value={form.order} onChange={set('order')} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active
          </label>
          <div className="flex gap-2">
            <button className="btn-primary">{editId ? 'Update' : <><FaPlus /> Add</>}</button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(blank); }} className="btn-outline">
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((b) => (
              <div key={b._id} className="card overflow-hidden">
                <img src={b.image} alt={b.title} className="h-32 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-cream capitalize text-charcoal/60">{b.position}</span>
                    <span className={`badge ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/50'}`}>
                      {b.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <p className="mt-2 font-medium">{b.title || '—'}</p>
                  <p className="text-xs text-charcoal/50">{b.subtitle}</p>
                  <div className="mt-3 flex gap-3 text-sm">
                    <button onClick={() => edit(b)} className="text-gold-700"><FaEdit /> Edit</button>
                    <button onClick={() => remove(b._id)} className="text-red-600"><FaTrash /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default Banners;
