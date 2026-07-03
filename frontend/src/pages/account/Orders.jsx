import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen } from 'react-icons/fa';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

const Orders = () => {
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (orders.length === 0)
    return (
      <EmptyState
        icon={<FaBoxOpen />}
        title="No orders yet"
        message="When you place an order, it will show up here."
        actionText="Start shopping"
        actionTo="/shop"
      />
    );

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <Link key={o._id} to={`/account/orders/${o._id}`} className="card block p-5 hover:border-gold-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{o.orderNumber}</p>
              <p className="text-xs text-charcoal/50">Placed {formatDate(o.createdAt)}</p>
            </div>
            <span className={`badge ${STATUS_STYLES[o.status]}`}>{o.status}</span>
            <span className="font-semibold">{formatPrice(o.totalPrice, symbol)}</span>
          </div>
          <div className="mt-3 flex -space-x-2">
            {o.items.slice(0, 5).map((it, i) => (
              <img
                key={i}
                src={it.image}
                alt={it.name}
                className="h-12 w-12 rounded-md border-2 border-white object-cover"
              />
            ))}
            {o.items.length > 5 && (
              <span className="grid h-12 w-12 place-items-center rounded-md bg-cream text-xs">
                +{o.items.length - 5}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Orders;
