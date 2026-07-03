import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
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
  const [data, setData] = useState({ orders: [], page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (status) params.set('status', status);
    api
      .get(`/orders?${params}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Orders</h1>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="input max-w-[200px]"
        >
          <option value="">All statuses</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-charcoal/60">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o._id} className="border-t border-charcoal/10 hover:bg-cream/50">
                  <td className="p-3">
                    <Link to={`/admin/orders/${o._id}`} className="font-medium text-gold-700 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    {o.user?.name}
                    <br />
                    <span className="text-xs text-charcoal/40">{o.user?.email}</span>
                  </td>
                  <td className="p-3 text-charcoal/60">{formatDate(o.createdAt)}</td>
                  <td className="p-3 font-medium">{formatPrice(o.totalPrice, symbol)}</td>
                  <td className="p-3">
                    <span className={`badge ${o.isPaid ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/50'}`}>
                      {o.isPaid ? 'Paid' : o.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`badge capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.orders.length === 0 && <p className="p-6 text-center text-charcoal/50">No orders found.</p>}
        </div>
      )}

      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </div>
  );
};

export default Orders;
