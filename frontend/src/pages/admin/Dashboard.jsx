import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShoppingCart,
  FaBoxOpen,
  FaUsers,
  FaRupeeSign,
  FaExclamationTriangle,
  FaEnvelopeOpenText,
  FaBell,
} from 'react-icons/fa';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatPrice, formatDate } from '../../utils/format.js';

const Dashboard = () => {
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const enquiryMode = settings.enquiryMode;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <p>Could not load dashboard.</p>;

  const cards = enquiryMode
    ? [
        { label: 'Total Enquiries', value: stats.totalEnquiries ?? 0, icon: <FaEnvelopeOpenText />, color: 'bg-gold-100 text-gold-700' },
        { label: 'New Enquiries', value: stats.newEnquiries ?? 0, icon: <FaBell />, color: 'bg-green-100 text-green-700' },
        { label: 'Products', value: stats.totalProducts, icon: <FaBoxOpen />, color: 'bg-blue-100 text-blue-700' },
        { label: 'Customers', value: stats.totalCustomers, icon: <FaUsers />, color: 'bg-purple-100 text-purple-700' },
      ]
    : [
        { label: 'Revenue', value: formatPrice(stats.totalRevenue, symbol), icon: <FaRupeeSign />, color: 'bg-green-100 text-green-700' },
        { label: 'Orders', value: stats.totalOrders, icon: <FaShoppingCart />, color: 'bg-blue-100 text-blue-700' },
        { label: 'Products', value: stats.totalProducts, icon: <FaBoxOpen />, color: 'bg-gold-100 text-gold-700' },
        { label: 'Customers', value: stats.totalCustomers, icon: <FaUsers />, color: 'bg-purple-100 text-purple-700' },
      ];

  const maxRev = Math.max(1, ...stats.salesSeries.map((s) => s.revenue));

  const lowStockCard = (
    <div className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl">
        <FaExclamationTriangle className="text-orange-500" /> Low Stock
      </h2>
      {stats.lowStock.length === 0 ? (
        <p className="text-sm text-charcoal/50">All products are well stocked.</p>
      ) : (
        <ul className="divide-y divide-charcoal/10 text-sm">
          {stats.lowStock.map((p) => (
            <li key={p._id} className="flex items-center justify-between py-2">
              <span>{p.name}</span>
              <span className="badge bg-orange-100 text-orange-700">{p.stock} left</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-5">
            <div className={`grid h-12 w-12 place-items-center rounded-lg text-lg ${c.color}`}>{c.icon}</div>
            <div>
              <p className="text-sm text-charcoal/50">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {enquiryMode ? (
        /* ---- Enquiry-mode dashboard ---- */
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl">Recent Enquiries</h2>
              <Link to="/admin/enquiries" className="text-sm text-gold-700 hover:underline">
                View all
              </Link>
            </div>
            {stats.recentEnquiries?.length ? (
              <ul className="divide-y divide-charcoal/10 text-sm">
                {stats.recentEnquiries.map((e) => (
                  <li key={e._id} className="py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{e.name}</span>
                      <span className="shrink-0 text-xs text-charcoal/40">{formatDate(e.createdAt)}</span>
                    </div>
                    <p className="truncate text-charcoal/55">{e.subject || e.productName || e.email}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-charcoal/50">No enquiries yet.</p>
            )}
          </div>

          {lowStockCard}
        </div>
      ) : (
        /* ---- Order-mode dashboard ---- */
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <h2 className="mb-4 font-serif text-xl">Revenue — last 30 days</h2>
              {stats.salesSeries.length === 0 ? (
                <p className="text-sm text-charcoal/50">No sales in this period yet.</p>
              ) : (
                <div className="flex h-44 items-end gap-1">
                  {stats.salesSeries.map((s) => (
                    <div key={s._id} className="group flex flex-1 flex-col items-center justify-end">
                      <div
                        className="w-full rounded-t bg-gold-400 transition-colors group-hover:bg-gold-600"
                        style={{ height: `${(s.revenue / maxRev) * 100}%` }}
                        title={`${s._id}: ${formatPrice(s.revenue, symbol)}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="mb-4 font-serif text-xl">Orders by Status</h2>
              <ul className="space-y-2 text-sm">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <li key={s} className="flex items-center justify-between">
                    <span className="capitalize text-charcoal/70">{s}</span>
                    <span className="font-semibold">{stats.ordersByStatus?.[s] || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl">Recent Orders</h2>
                <Link to="/admin/orders" className="text-sm text-gold-700 hover:underline">
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-charcoal/10 text-sm">
                {stats.recentOrders.map((o) => (
                  <li key={o._id} className="flex items-center justify-between py-2">
                    <Link to={`/admin/orders/${o._id}`} className="hover:text-gold-700">
                      {o.orderNumber}
                    </Link>
                    <span className="text-charcoal/50">{o.user?.name}</span>
                    <span className="font-medium">{formatPrice(o.totalPrice, symbol)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {lowStockCard}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
