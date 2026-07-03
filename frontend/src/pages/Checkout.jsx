import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPrice } from '../utils/format.js';

const emptyAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const settings = useSettings();
  const navigate = useNavigate();
  const symbol = settings.currency?.symbol || '₹';

  const [address, setAddress] = useState(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items.length, navigate]);

  // Prefill from saved addresses.
  useEffect(() => {
    api
      .get('/users/addresses')
      .then((res) => {
        setSavedAddresses(res.data.addresses);
        const def = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
        if (def) setAddress({ ...emptyAddress, ...def });
      })
      .catch(() => {});
  }, []);

  const freeThreshold = settings.shipping?.freeShippingThreshold ?? 5000;
  const taxable = Math.max(0, subtotal - discount);
  const shipping = taxable >= freeThreshold ? 0 : settings.shipping?.flatRate ?? 99;
  const taxRate = settings.tax?.rate ?? 3;
  const tax = Math.round((taxable * taxRate) / 100);
  const total = taxable + tax + shipping;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await api.post('/coupons/validate', { code: coupon, subtotal });
      setDiscount(res.data.discount);
      setAppliedCode(res.data.code);
      toast.success(`Coupon ${res.data.code} applied`);
    } catch (err) {
      setDiscount(0);
      setAppliedCode('');
      toast.error(err.message);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity, variant: i.variant })),
        shippingAddress: address,
        paymentMethod,
        couponCode: appliedCode || undefined,
      });
      clearCart();
      toast.success('Order placed!');
      navigate(`/order-success/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  const set = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  return (
    <div className="container-page py-8">
      <Seo title="Checkout" />
      <h1 className="mb-8 font-serif text-3xl font-bold">Checkout</h1>

      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: address + payment */}
        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="mb-4 font-serif text-xl">Shipping Address</h2>

            {savedAddresses.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {savedAddresses.map((a) => (
                  <button
                    type="button"
                    key={a._id}
                    onClick={() => setAddress({ ...emptyAddress, ...a })}
                    className="rounded-md border border-charcoal/15 px-3 py-1.5 text-xs hover:border-gold-500"
                  >
                    {a.label}: {a.line1}, {a.city}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={address.fullName} onChange={set('fullName')} required />
              <Field label="Phone" value={address.phone} onChange={set('phone')} required />
              <Field label="Address line 1" value={address.line1} onChange={set('line1')} required full />
              <Field label="Address line 2" value={address.line2} onChange={set('line2')} full />
              <Field label="City" value={address.city} onChange={set('city')} required />
              <Field label="State" value={address.state} onChange={set('state')} required />
              <Field label="Postal code" value={address.postalCode} onChange={set('postalCode')} required />
              <Field label="Country" value={address.country} onChange={set('country')} required />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 font-serif text-xl">Payment Method</h2>
            <div className="space-y-3">
              {[
                ['COD', 'Cash on Delivery'],
                ['UPI', 'UPI'],
                ['Card', 'Credit / Debit Card'],
                ['NetBanking', 'Net Banking'],
              ].map(([val, label]) => (
                <label key={val} className="flex cursor-pointer items-center gap-3 rounded-md border border-charcoal/15 p-3 hover:border-gold-400">
                  <input
                    type="radio"
                    name="payment"
                    value={val}
                    checked={paymentMethod === val}
                    onChange={() => setPaymentMethod(val)}
                    className="text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-charcoal/50">
              This is a demo store — online payment is simulated and orders are created as unpaid.
            </p>
          </section>
        </div>

        {/* Right: summary */}
        <div className="h-fit card p-6">
          <h2 className="mb-4 font-serif text-xl">Order Summary</h2>
          <ul className="mb-4 max-h-56 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3 text-sm">
                <img src={i.image} alt="" className="h-12 w-12 rounded object-cover" />
                <div className="flex-1">
                  <p className="line-clamp-1">{i.name}</p>
                  <p className="text-xs text-charcoal/50">Qty {i.quantity}</p>
                </div>
                <span>{formatPrice(i.price * i.quantity, symbol)}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="input py-2 text-sm"
            />
            <button type="button" onClick={applyCoupon} className="btn-outline whitespace-nowrap">
              Apply
            </button>
          </div>

          <div className="my-4 space-y-1 border-t border-charcoal/10 pt-4">
            <Row label="Subtotal" value={formatPrice(subtotal, symbol)} />
            {discount > 0 && <Row label={`Discount (${appliedCode})`} value={`- ${formatPrice(discount, symbol)}`} />}
            <Row label={`Tax (${taxRate}%)`} value={formatPrice(tax, symbol)} />
            <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping, symbol)} />
          </div>
          <Row label="Total" value={formatPrice(total, symbol)} bold />

          <button disabled={placing} className="btn-primary mt-6 w-full">
            {placing ? 'Placing order…' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, full, ...props }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between ${bold ? 'text-lg font-semibold' : 'text-sm text-charcoal/70'}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default Checkout;
