import Carousel from './Carousel.jsx';
import ProductCard from './ProductCard.jsx';
import { ProductCardSkeleton } from './ui/Skeleton.jsx';

// Horizontal slider of product cards (with a loading skeleton state).
const ProductCarousel = ({ products = [], loading, skeletonCount = 6, ariaLabel = 'products' }) => {
  const itemClassName = 'w-full sm:w-[42%] md:w-[31%] lg:w-[23.5%]';

  if (loading) {
    return (
      <Carousel itemClassName={itemClassName} ariaLabel={ariaLabel}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </Carousel>
    );
  }

  if (!products.length) return null;

  return (
    <Carousel itemClassName={itemClassName} ariaLabel={ariaLabel}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
