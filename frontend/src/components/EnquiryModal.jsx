import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Enquiry form modal shown on product pages when the store runs in "enquiry mode"
 * (prices hidden). Submits to POST /api/enquiries.
 */
const EnquiryModal = ({ product, onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: product ? `Enquiry: ${product.name}` : '',
    message: product ? `I'd like to enquire about "${product.name}". Please share the price and details.` : '',
  });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/enquiries', { ...form, product: product?._id });
      toast.success(res.data.message || 'Enquiry sent!');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-3">
          <h3 className="font-serif text-lg">Send an Enquiry</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-charcoal/60 hover:text-charcoal">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          {product && (
            <div className="flex items-center gap-3 rounded-lg bg-cream p-3">
              {product.images?.[0]?.url && (
                <img src={product.images[0].url} alt={product.name} className="h-12 w-12 rounded object-cover" />
              )}
              <p className="text-sm font-medium">{product.name}</p>
            </div>
          )}
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" required value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={set('subject')} placeholder="e.g. Price enquiry" />
          </div>
          <div>
            <label className="label">Your Enquiry</label>
            <textarea className="input h-24 resize-none" required value={form.message} onChange={set('message')} />
          </div>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Sending…' : 'Send Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnquiryModal;
