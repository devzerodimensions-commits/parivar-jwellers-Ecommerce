import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPrice } from '../utils/format.js';

const OrderSuccess = () => {
  const { id } = useParams();
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner className="py-32" />;

  return (
    <div className="container-page py-16">
      <Seo title="Order Confirmed" />
      <div className="mx-auto max-w-lg text-center">
        <FaCheckCircle className="mx-auto text-6xl text-green-500" />
        <h1 className="mt-4 font-serif text-3xl font-bold">Thank you for your order!</h1>
        {order && (
          <>
            <p className="mt-2 text-charcoal/60">
              Your order <span className="font-semibold text-charcoal">{order.orderNumber}</span> has been
              placed successfully.
            </p>
            <div className="card mt-8 p-6 text-left">
              <div className="flex justify-between border-b border-charcoal/10 pb-3">
                <span className="text-charcoal/60">Total</span>
                <span className="font-semibold">{formatPrice(order.totalPrice, symbol)}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-charcoal/60">Payment</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/account/orders" className="btn-primary">
            View My Orders
          </Link>
          <Link to="/shop" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
