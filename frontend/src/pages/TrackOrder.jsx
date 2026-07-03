import { useState } from 'react';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPrice, formatDate } from '../utils/format.js';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STEP_LABEL = { pending: 'Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };

const TrackOrder = () => {
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const [form, setForm] = useState({ orderNumber: '', email: '' });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const track = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(
        `/orders/track/${encodeURIComponent(form.orderNumber)}?email=${encodeURIComponent(form.email)}`
      );
      setOrder(res.data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? (order.status === 'cancelled' ? -1 : STEPS.indexOf(order.status)) : -1;

  return (
    <div className="container-page py-12">
      <Seo title="Track Order" />
      <div className="mx-auto max-w-xl">
        <h1 className="mb-2 text-center font-serif text-3xl font-bold">Track Your Order</h1>
        <p className="mb-8 text-center text-charcoal/60">
          Enter your order number and email to see the latest status.
        </p>

        <form onSubmit={track} className="card space-y-4 p-6">
          <div>
            <label className="label">Order number</label>
            <input
              className="input"
              required
              placeholder="JW-20260630-1234"
              value={form.orderNumber}
              onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Tracking…' : 'Track Order'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {order && (
          <div className="card mt-8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-lg">{order.orderNumber}</p>
                <p className="text-xs text-charcoal/50">Placed {formatDate(order.createdAt)}</p>
              </div>
              <span className="font-semibold">{formatPrice(order.totalPrice, symbol)}</span>
            </div>

            {order.status === 'cancelled' ? (
              <p className="mt-6 rounded-md bg-red-50 p-4 text-center text-red-700">This order was cancelled.</p>
            ) : (
              <div className="mt-8 flex justify-between">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex flex-1 flex-col items-center">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                        i <= currentStep ? 'bg-gold-600 text-white' : 'bg-charcoal/10 text-charcoal/40'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className={`mt-2 text-xs ${i <= currentStep ? 'text-charcoal' : 'text-charcoal/40'}`}>
                      {STEP_LABEL[s]}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {order.trackingNumber && (
              <p className="mt-6 text-sm text-charcoal/70">
                Courier: <span className="font-medium">{order.courier}</span> · Tracking #
                <span className="font-medium">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
