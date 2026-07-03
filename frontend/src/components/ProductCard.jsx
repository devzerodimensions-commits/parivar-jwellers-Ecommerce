import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingBag, FaEnvelopeOpenText } from 'react-icons/fa';
import LazyImage from './ui/LazyImage.jsx';
import Rating from './ui/Rating.jsx';
import EnquiryButton from './EnquiryButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPrice, effectivePrice, discountPercent } from '../utils/format.js';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';
  const enquiryMode = settings.enquiryMode;

  const price = effectivePrice(product);
  const off = discountPercent(product);
  const wished = has(product._id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group card relative overflow-hidden">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {!enquiryMode && off > 0 && <span className="badge bg-gold-600 text-white">-{off}%</span>}
        {product.isNewArrival && <span className="badge bg-charcoal text-white">New</span>}
        {!enquiryMode && outOfStock && <span className="badge bg-red-100 text-red-700">Sold out</span>}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => toggle(product._id)}
        aria-label="Toggle wishlist"
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-charcoal shadow hover:text-gold-600"
      >
        {wished ? <FaHeart className="text-gold-600" /> : <FaRegHeart />}
      </button>

      <Link to={`/product/${product.slug}`} className="block">
        <LazyImage
          src={product.images?.[0]?.url}
          alt={product.images?.[0]?.alt || product.name}
          className="aspect-square w-full bg-cream"
        />
      </Link>

      <div className="p-4">
        {product.category?.name && (
          <p className="mb-1 text-xs uppercase tracking-wide text-charcoal/40">
            {product.category.name}
          </p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6rem] font-serif text-lg leading-snug text-charcoal hover:text-gold-700">
            {product.name}
          </h3>
        </Link>

        {product.ratingCount > 0 && (
          <div className="mt-1">
            <Rating value={product.ratingAverage} count={product.ratingCount} />
          </div>
        )}

        {enquiryMode ? (
          <EnquiryButton className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-gold-500 py-2 text-sm font-medium text-gold-700 transition-colors hover:bg-gold-600 hover:text-white">
            <FaEnvelopeOpenText className="text-xs" /> Enquire
          </EnquiryButton>
        ) : (
          <div className="mt-2 flex items-end justify-between">
            <div>
              <span className="text-lg font-semibold text-charcoal">{formatPrice(price, symbol)}</span>
              {off > 0 && (
                <span className="ml-2 text-sm text-charcoal/40 line-through">
                  {formatPrice(product.price, symbol)}
                </span>
              )}
            </div>
            <button
              disabled={outOfStock}
              onClick={() => addItem(product, 1)}
              aria-label="Add to cart"
              className="grid h-10 w-10 place-items-center rounded-md bg-charcoal text-white transition-colors hover:bg-gold-600 disabled:opacity-40"
            >
              <FaShoppingBag className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
