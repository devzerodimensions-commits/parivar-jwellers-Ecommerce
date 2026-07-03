import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatDate } from '../../utils/format.js';

const blank = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  minPurchase: 0,
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

const Coupons = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);

  const load = () =>
    api
      .get('/coupons')
      .then((res) => setItems(res.data.coupons))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      value: Number(form.value),
      minPurchase: Number(form.minPurchase) || 0,
      maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      expiresAt: form.expiresAt || null,
    };
    try {
      if (editId) await api.put(`/coupons/${editId}`, payload);
      else await api.post('/coupons', payload);
      toast.success(editId ? 'Coupon updated.' : 'Coupon created.');
      setForm(blank);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const edit = (c) => {
    setEditId(c._id);
    setForm({
      code: c.code,
      description: c.description || '',
      type: c.type,
      value: c.value,
      minPurchase: c.minPurchase || 0,
      maxDiscount: c.maxDiscount ?? '',
      usageLimit: c.usageLimit ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      isActive: c.isActive,
    });
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-bold">Coupons</h1>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-3 p-6">
          <h3 className="font-serif text-lg">{editId ? 'Edit Coupon' : 'Add Coupon'}</h3>
          <Field label="Code" value={form.code} onChange={set('code')} required />
          <Field label="Description" value={form.description} onChange={set('description')} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={set('type')}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed ₹</option>
              </select>
            </div>
            <Field label="Value" type="number" value={form.value} onChange={set('value')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min purchase" type="number" value={form.minPurchase} onChange={set('minPurchase')} />
            <Field label="Max discount" type="number" value={form.maxDiscount} onChange={set('maxDiscount')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Usage limit" type="number" value={form.usageLimit} onChange={set('usageLimit')} />
            <Field label="Expires" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
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
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-charcoal/60">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Used</th>
                  <th className="p-3">Expires</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id} className="border-t border-charcoal/10">
                    <td className="p-3 font-mono font-medium">{c.code}</td>
                    <td className="p-3">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td className="p-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="p-3 text-charcoal/60">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                    <td className="p-3">
                      <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/50'}`}>
                        {c.isActive ? 'Active' : 'Off'}
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

const Field = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default Coupons;
