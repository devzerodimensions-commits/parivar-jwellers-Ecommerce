import ProductCard from './ProductCard.jsx';
import { ProductCardSkeleton } from './ui/Skeleton.jsx';

// Responsive grid of product cards, with a loading skeleton state.
const ProductGrid = ({ products = [], loading, skeletonCount = 8, cols = 4 }) => {
  const gridCols =
    cols === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid gap-5 ${gridCols}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-5 ${gridCols}`}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid;
