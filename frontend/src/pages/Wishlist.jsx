import { useEffect, useState } from 'react';
import { FaRegHeart } from 'react-icons/fa';
import api from '../api/axios.js';
import Seo from '../components/ui/Seo.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

const Wishlist = () => {
  const { user } = useAuth();
  const { ids } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user) {
          const res = await api.get('/users/wishlist');
          setProducts(res.data.wishlist);
        } else {
          // Guests keep wishlist ids on-device; they sync after login.
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ids.length]);

  if (loading) return <Spinner className="py-32" />;

  if (!user && ids.length > 0) {
    return (
      <div className="container-page">
        <Seo title="Wishlist" />
        <EmptyState
          icon={<FaRegHeart />}
          title="Log in to view your wishlist"
          message="Your saved items are stored on your device. Log in to sync and view them here."
          actionText="Log in"
          actionTo="/login"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Seo title="Wishlist" />
      <h1 className="mb-8 font-serif text-3xl font-bold">My Wishlist</h1>
      {products.length === 0 ? (
        <EmptyState
          icon={<FaRegHeart />}
          title="Your wishlist is empty"
          message="Tap the heart on any product to save it here."
          actionText="Explore jewellery"
          actionTo="/shop"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};

export default Wishlist;
