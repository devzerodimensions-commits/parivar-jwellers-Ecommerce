import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaHeart,
  FaRegHeart,
  FaShoppingBag,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaCheckCircle,
  FaEnvelopeOpenText,
} from 'react-icons/fa';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Rating from '../components/ui/Rating.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductReviews from '../components/ProductReviews.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import EnquiryButton from '../components/EnquiryButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPrice, effectivePrice, discountPercent } from '../utils/format.js';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const settings = useSettings();
  const symbol = settings.currency?.symbol || '₹';

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState({});
  const enquiryMode = settings.enquiryMode;

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.product);
        setRelated(res.data.related);
        setActiveImg(0);
        setQty(1);
        setVariant({});
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner className="py-32" />;
  if (!product)
    return (
      <div className="container-page py-32 text-center">
        <h2 className="font-serif text-2xl">Product not found</h2>
        <Link to="/shop" className="btn-primary mt-6">
          Back to shop
        </Link>
      </div>
    );

  const price = effectivePrice(product);
  const off = discountPercent(product);
  const wished = has(product._id);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);

  const variantLabel = Object.entries(variant)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return (
    <div className="container-page py-8">
      <Seo
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.shortDescription}
        image={product.images?.[0]?.url}
        type="product"
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-charcoal/50">
        <Link to="/" className="hover:text-gold-700">Home</Link> /{' '}
        <Link to="/shop" className="hover:text-gold-700">Shop</Link>
        {product.category && (
          <>
            {' '}/{' '}
            <Link to={`/category/${product.category.slug}`} className="hover:text-gold-700">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-lg border border-charcoal/10 bg-white">
            <img
              src={product.images?.[activeImg]?.url}
              alt={product.images?.[activeImg]?.alt || product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-md border-2 ${
                    i === activeImg ? 'border-gold-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand?.name && (
            <p className="text-sm uppercase tracking-wide text-gold-600">{product.brand.name}</p>
          )}
          <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            {product.ratingCount > 0 && (
              <Rating value={product.ratingAverage} count={product.ratingCount} />
            )}
            {product.sku && <span className="text-sm text-charcoal/50">SKU: {product.sku}</span>}
          </div>

          {!enquiryMode && (
            <>
              <div className="mt-5 flex items-end gap-3">
                <span className="text-3xl font-semibold text-charcoal">{formatPrice(price, symbol)}</span>
                {off > 0 && (
                  <>
                    <span className="text-lg text-charcoal/40 line-through">
                      {formatPrice(product.price, symbol)}
                    </span>
                    <span className="badge bg-gold-100 text-gold-800">Save {off}%</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-charcoal/40">Inclusive of all taxes</p>
            </>
          )}
          {enquiryMode && (
            <p className="mt-5 text-lg font-medium text-gold-700">Price on enquiry</p>
          )}

          {product.shortDescription && (
            <p className="mt-5 text-charcoal/70">{product.shortDescription}</p>
          )}

          {/* Variants */}
          {product.variants?.map((v) => (
            <div key={v._id || v.name} className="mt-5">
              <span className="label">{v.name}</span>
              <div className="flex flex-wrap gap-2">
                {v.options.map((o) => (
                  <button
                    key={o.label}
                    onClick={() => setVariant((prev) => ({ ...prev, [v.name]: o.label }))}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      variant[v.name] === o.label
                        ? 'border-gold-600 bg-gold-50 text-gold-800'
                        : 'border-charcoal/15 hover:border-gold-400'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Stock + quantity + actions */}
          <div className="mt-6">
            {outOfStock ? (
              <p className="font-medium text-red-600">Currently out of stock</p>
            ) : lowStock ? (
              <p className="text-sm font-medium text-orange-600">Only {product.stock} left in stock</p>
            ) : (
              <p className="text-sm font-medium text-green-600">In stock</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {enquiryMode ? (
              <EnquiryButton className="btn-primary flex-1">
                <FaEnvelopeOpenText /> Send Enquiry
              </EnquiryButton>
            ) : (
              <>
                <div className="flex items-center rounded-md border border-charcoal/15">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-lg"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-10 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-lg"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={outOfStock}
                  onClick={() => addItem(product, qty, variantLabel)}
                  className="btn-dark flex-1"
                >
                  <FaShoppingBag /> Add to Cart
                </button>
              </>
            )}
            <button
              onClick={() => toggle(product._id)}
              className="btn-outline"
              aria-label="Wishlist"
            >
              {wished ? <FaHeart className="text-gold-600" /> : <FaRegHeart />}
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-charcoal/10 pt-6 text-sm sm:grid-cols-4">
            {[
              [<FaShieldAlt key="s" />, 'Hallmarked'],
              [<FaCheckCircle key="c" />, 'Certified'],
              [<FaTruck key="t" />, 'Insured Shipping'],
              [<FaUndo key="u" />, '15-Day Returns'],
            ].map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center text-charcoal/60">
                <span className="text-xl text-gold-600">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details: description + specs */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-serif text-2xl">Description</h3>
          <p className="whitespace-pre-line text-charcoal/70">{product.description}</p>
        </div>
        {product.attributes?.length > 0 && (
          <div>
            <h3 className="mb-3 font-serif text-2xl">Specifications</h3>
            <table className="w-full text-sm">
              <tbody>
                {product.attributes.map((a, i) => (
                  <tr key={i} className="border-b border-charcoal/10">
                    <td className="py-2.5 pr-4 font-medium text-charcoal/60">{a.key}</td>
                    <td className="py-2.5 text-charcoal">{a.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-charcoal/10 pt-12">
        <ProductReviews productId={product._id} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeading eyebrow="You may also like" title="Related Pieces" />
          <ProductGrid products={related.slice(0, 4)} />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
