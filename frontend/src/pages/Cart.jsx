import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import Seo from '../components/ui/Seo.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';

const Cart = () => {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const settings = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const symbol = settings.currency?.symbol || '₹';

  const freeThreshold = settings.shipping?.freeShippingThreshold ?? 5000;
  const shipping = subtotal >= freeThreshold || subtotal === 0 ? 0 : settings.shipping?.flatRate ?? 99;

  const goCheckout = () => {
    if (!user) return navigate('/login', { state: { from: '/checkout' } });
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container-page">
        <Seo title="Cart" />
        <EmptyState
          icon={<FaShoppingBag />}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
          actionText="Continue shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Seo title="Cart" />
      <h1 className="mb-8 font-serif text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="card flex gap-4 p-4">
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-md object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <Link to={`/product/${item.slug}`} className="font-serif text-lg hover:text-gold-700">
                    {item.name}
                  </Link>
                  <button onClick={() => removeItem(item.key)} aria-label="Remove" className="text-charcoal/40 hover:text-red-600">
                    <FaTrash />
                  </button>
                </div>
                {item.variant && <p className="text-xs text-charcoal/50">{item.variant}</p>}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-charcoal/15">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="px-3 py-1.5">
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="px-3 py-1.5"
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity, symbol)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit card p-6">
          <h2 className="mb-4 font-serif text-xl">Order Summary</h2>
          <Row label="Subtotal" value={formatPrice(subtotal, symbol)} />
          <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping, symbol)} />
          {shipping > 0 && (
            <p className="mt-2 text-xs text-charcoal/50">
              Add {formatPrice(freeThreshold - subtotal, symbol)} more for free shipping.
            </p>
          )}
          <div className="my-4 border-t border-charcoal/10" />
          <Row label="Estimated total" value={formatPrice(subtotal + shipping, symbol)} bold />
          <button onClick={goCheckout} className="btn-primary mt-6 w-full">
            Proceed to Checkout
          </button>
          <Link to="/shop" className="mt-3 block text-center text-sm text-gold-700 hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between py-1 ${bold ? 'text-lg font-semibold' : 'text-sm text-charcoal/70'}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default Cart;
