import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const blank = { name: '', description: '', image: '', isFeatured: false, isActive: true, order: 0 };

const Categories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);

  const load = () =>
    api
      .get('/categories?all=true')
      .then((res) => setItems(res.data.categories))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/categories/${editId}`, form);
      else await api.post('/categories', form);
      toast.success(editId ? 'Category updated.' : 'Category created.');
      setForm(blank);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const edit = (c) => {
    setEditId(c._id);
    setForm({ name: c.name, description: c.description || '', image: c.image || '', isFeatured: c.isFeatured, isActive: c.isActive, order: c.order || 0 });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-bold">Categories</h1>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Form */}
        <form onSubmit={submit} className="card h-fit space-y-4 p-6">
          <h3 className="font-serif text-lg">{editId ? 'Edit Category' : 'Add Category'}</h3>
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Image</label>
            <ImageUploader value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
            <input className="input mt-2" placeholder="…or image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
            </label>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">{editId ? 'Update' : <><FaPlus /> Add</>}</button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(blank); }} className="btn-outline">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        {loading ? (
          <Spinner />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-charcoal/60">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Products</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id} className="border-t border-charcoal/10">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {c.image && <img src={c.image} alt="" className="h-9 w-9 rounded object-cover" />}
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-charcoal/40">/{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{c.productCount ?? 0}</td>
                    <td className="p-3">
                      <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/50'}`}>
                        {c.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => edit(c)} className="text-gold-700"><FaEdit /></button>
                        <button onClick={() => remove(c._id)} className="text-red-600"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
