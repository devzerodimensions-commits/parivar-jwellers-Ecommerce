import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderDetail = () => {
  const { id } = useParams();
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', trackingNumber: '', courier: '' });
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data.order);
      setStatusForm({
        status: res.data.order.status,
        note: '',
        trackingNumber: res.data.order.trackingNumber || '',
        courier: res.data.order.courier || '',
      });
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/orders/${id}/status`, statusForm);
      toast.success('Order updated.');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async () => {
    try {
      await api.put(`/orders/${id}/pay`);
      toast.success('Marked as paid.');
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/orders" className="text-sm text-gold-700 hover:underline">
          ← Orders
        </Link>
        <h1 className="font-serif text-3xl font-bold">{order.orderNumber}</h1>
        <p className="text-sm text-charcoal/50">
          {order.user?.name} · {order.user?.email} · {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items + address */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 font-medium">Items</h3>
            <ul className="divide-y divide-charcoal/10">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <img src={it.image} alt="" className="h-12 w-12 rounded object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-charcoal/50">
                      {it.sku} · Qty {it.quantity} {it.variant && `· ${it.variant}`}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(it.price * it.quantity, symbol)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 ml-auto w-60 space-y-1 text-sm">
              <Row label="Subtotal" value={formatPrice(order.itemsPrice, symbol)} />
              {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`- ${formatPrice(order.discount, symbol)}`} />}
              <Row label="Tax" value={formatPrice(order.taxPrice, symbol)} />
              <Row label="Shipping" value={order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice, symbol)} />
              <Row label="Total" value={formatPrice(order.totalPrice, symbol)} bold />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-medium">Shipping Address</h3>
            <address className="text-sm not-italic leading-relaxed text-charcoal/70">
              {order.shippingAddress?.fullName}
              <br />
              {order.shippingAddress?.line1} {order.shippingAddress?.line2}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country} · {order.shippingAddress?.phone}
            </address>
          </div>
        </div>

        {/* Status panel */}
        <div className="space-y-6">
          <form onSubmit={updateStatus} className="card space-y-4 p-5">
            <h3 className="font-medium">Update Status</h3>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
              className="input capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Courier (e.g. BlueDart)"
              value={statusForm.courier}
              onChange={(e) => setStatusForm((f) => ({ ...f, courier: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Tracking number"
              value={statusForm.trackingNumber}
              onChange={(e) => setStatusForm((f) => ({ ...f, trackingNumber: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Note (optional)"
              value={statusForm.note}
              onChange={(e) => setStatusForm((f) => ({ ...f, note: e.target.value }))}
            />
            <button disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Update Order'}
            </button>
          </form>

          <div className="card p-5">
            <h3 className="mb-2 font-medium">Payment</h3>
            <p className="text-sm text-charcoal/60">
              {order.paymentMethod} · {order.isPaid ? 'Paid' : 'Pending'}
            </p>
            {!order.isPaid && (
              <button onClick={markPaid} className="btn-dark mt-3 w-full">
                Mark as Paid
              </button>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-2 font-medium">History</h3>
            <ol className="space-y-2 text-xs text-charcoal/60">
              {order.statusHistory?.map((s, i) => (
                <li key={i}>
                  <span className="capitalize text-charcoal">{s.status}</span> — {s.note}
                  <span className="block text-charcoal/40">{formatDate(s.at)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between ${bold ? 'border-t border-charcoal/10 pt-1 font-semibold' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default OrderDetail;
