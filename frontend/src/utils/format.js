// Format a number as Indian Rupees (no decimals for whole amounts).
export const formatPrice = (value, symbol = '₹') => {
  const n = Number(value) || 0;
  return `${symbol}${n.toLocaleString('en-IN', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

// The effective price of a product (sale price if it's a genuine discount).
export const effectivePrice = (product) => {
  if (product?.salePrice && product.salePrice > 0 && product.salePrice < product.price) {
    return product.salePrice;
  }
  return product?.price || 0;
};

export const discountPercent = (product) => {
  if (product?.salePrice && product.salePrice > 0 && product.salePrice < product.price) {
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  }
  return 0;
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Resolve a possibly-relative image URL against the API origin.
export const imageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return url; // already root-relative (served via proxy / same origin)
};
