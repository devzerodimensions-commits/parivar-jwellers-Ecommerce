import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaTrash, FaPlus, FaStar } from 'react-icons/fa';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';

const empty = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    api
      .get('/users/addresses')
      .then((res) => setAddresses(res.data.addresses))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', form);
      setAddresses(res.data.addresses);
      setForm(empty);
      setShowForm(false);
      toast.success('Address added.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (addressId) => {
    try {
      const res = await api.delete(`/users/addresses/${addressId}`);
      setAddresses(res.data.addresses);
      toast.success('Address removed.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const makeDefault = async (addressId) => {
    try {
      const res = await api.put(`/users/addresses/${addressId}`, { isDefault: true });
      setAddresses(res.data.addresses);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Saved Addresses</h2>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          <FaPlus /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={add} className="card grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Label" value={form.label} onChange={set('label')} />
          <Field label="Full name" value={form.fullName} onChange={set('fullName')} required />
          <Field label="Phone" value={form.phone} onChange={set('phone')} required />
          <Field label="Address line 1" value={form.line1} onChange={set('line1')} required full />
          <Field label="Address line 2" value={form.line2} onChange={set('line2')} full />
          <Field label="City" value={form.city} onChange={set('city')} required />
          <Field label="State" value={form.state} onChange={set('state')} required />
          <Field label="Postal code" value={form.postalCode} onChange={set('postalCode')} required />
          <Field label="Country" value={form.country} onChange={set('country')} required />
          <div className="sm:col-span-2">
            <button className="btn-dark">Save Address</button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <p className="text-sm text-charcoal/50">No saved addresses yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a._id} className="card relative p-5">
              <div className="flex items-center gap-2">
                <span className="badge bg-cream text-charcoal/70">{a.label}</span>
                {a.isDefault && <span className="badge bg-gold-100 text-gold-800">Default</span>}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                {a.fullName}
                <br />
                {a.line1}
                {a.line2 && `, ${a.line2}`}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.phone}
              </p>
              <div className="mt-3 flex gap-3 text-sm">
                {!a.isDefault && (
                  <button onClick={() => makeDefault(a._id)} className="text-gold-700 hover:underline">
                    <FaStar className="mr-1 inline" /> Set default
                  </button>
                )}
                <button onClick={() => remove(a._id)} className="text-red-600 hover:underline">
                  <FaTrash className="mr-1 inline" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Field = ({ label, full, ...props }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default Addresses;
