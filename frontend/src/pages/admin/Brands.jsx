import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';

const blank = { name: '', description: '', logo: '', isActive: true };

const Brands = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);

  const load = () =>
    api
      .get('/brands?all=true')
      .then((res) => setItems(res.data.brands))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/brands/${editId}`, form);
      else await api.post('/brands', form);
      toast.success(editId ? 'Brand updated.' : 'Brand created.');
      setForm(blank);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await api.delete(`/brands/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-bold">Brands / Collections</h1>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-4 p-6">
          <h3 className="font-serif text-lg">{editId ? 'Edit Brand' : 'Add Brand'}</h3>
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Logo</label>
            <ImageUploader value={form.logo} onChange={(url) => setForm((f) => ({ ...f, logo: url }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
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
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-charcoal/60">
                <tr>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b._id} className="border-t border-charcoal/10">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {b.logo && <img src={b.logo} alt="" className="h-9 w-9 rounded object-cover" />}
                        <span className="font-medium">{b.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`badge ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/50'}`}>
                        {b.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => { setEditId(b._id); setForm({ name: b.name, description: b.description || '', logo: b.logo || '', isActive: b.isActive }); }} className="text-gold-700"><FaEdit /></button>
                        <button onClick={() => remove(b._id)} className="text-red-600"><FaTrash /></button>
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

export default Brands;
