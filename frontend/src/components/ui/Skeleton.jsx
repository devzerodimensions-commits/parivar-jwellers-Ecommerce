// Lightweight shimmer placeholder used while content loads.
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-charcoal/10 ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="space-y-2 p-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export default Skeleton;
