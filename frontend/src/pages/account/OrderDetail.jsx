import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';
import { downloadInvoice } from '../../utils/invoice.js';

const OrderDetail = () => {
  const { id } = useParams();
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <p>Order not found.</p>;

  const canCancel = ['pending', 'processing'].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/account/orders" className="text-sm text-gold-700 hover:underline">
            ← All orders
          </Link>
          <h2 className="mt-1 font-serif text-2xl font-bold">{order.orderNumber}</h2>
          <p className="text-xs text-charcoal/50">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadInvoice(order, settings)} className="btn-outline">
            Download Invoice
          </button>
          {canCancel && (
            <button onClick={cancel} className="btn bg-red-50 text-red-700 hover:bg-red-100">
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status timeline */}
      <div className="card p-5">
        <h3 className="mb-3 font-medium">Status: <span className="capitalize text-gold-700">{order.status}</span></h3>
        <ol className="space-y-2 text-sm">
          {order.statusHistory?.map((s, i) => (
            <li key={i} className="flex items-center gap-3 text-charcoal/70">
              <span className="h-2 w-2 rounded-full bg-gold-500" />
              <span className="capitalize">{s.status}</span>
              <span className="text-charcoal/40">— {s.note}</span>
              <span className="ml-auto text-xs text-charcoal/40">{formatDate(s.at)}</span>
            </li>
          ))}
        </ol>
        {order.trackingNumber && (
          <p className="mt-3 text-sm">
            Tracking: <strong>{order.courier} #{order.trackingNumber}</strong>
          </p>
        )}
      </div>

      {/* Items */}
      <div className="card p-5">
        <h3 className="mb-3 font-medium">Items</h3>
        <ul className="divide-y divide-charcoal/10">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center gap-4 py-3">
              <img src={it.image} alt={it.name} className="h-14 w-14 rounded-md object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">{it.name}</p>
                {it.variant && <p className="text-xs text-charcoal/50">{it.variant}</p>}
                <p className="text-xs text-charcoal/50">Qty {it.quantity}</p>
              </div>
              <span className="text-sm font-medium">{formatPrice(it.price * it.quantity, symbol)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals + address */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-medium">Payment Summary</h3>
          <Row label="Subtotal" value={formatPrice(order.itemsPrice, symbol)} />
          {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`- ${formatPrice(order.discount, symbol)}`} />}
          <Row label="Tax" value={formatPrice(order.taxPrice, symbol)} />
          <Row label="Shipping" value={order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice, symbol)} />
          <div className="my-2 border-t border-charcoal/10" />
          <Row label="Total" value={formatPrice(order.totalPrice, symbol)} bold />
          <p className="mt-3 text-xs text-charcoal/50">
            {order.paymentMethod} · {order.isPaid ? 'Paid' : 'Payment pending'}
          </p>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-medium">Shipping Address</h3>
          {order.shippingAddress && (
            <address className="text-sm not-italic leading-relaxed text-charcoal/70">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </address>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between py-0.5 ${bold ? 'font-semibold' : 'text-sm text-charcoal/70'}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default OrderDetail;
