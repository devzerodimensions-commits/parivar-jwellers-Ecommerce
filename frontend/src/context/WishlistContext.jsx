import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);
const GUEST_KEY = 'jewelly_wishlist';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  // Store an array of product ids the user has wishlisted.
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
    } catch {
      return [];
    }
  });

  // When logged in, hydrate from the server.
  useEffect(() => {
    if (!user) return;
    api
      .get('/users/wishlist')
      .then((res) => setIds(res.data.wishlist.map((p) => p._id)))
      .catch(() => {});
  }, [user]);

  // Persist guest wishlist locally.
  useEffect(() => {
    if (!user) localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
  }, [ids, user]);

  const has = useCallback((productId) => ids.includes(productId), [ids]);

  const toggle = useCallback(
    async (productId) => {
      const wasIn = ids.includes(productId);
      setIds((prev) => (wasIn ? prev.filter((id) => id !== productId) : [...prev, productId]));
      if (user) {
        try {
          await api.post(`/users/wishlist/${productId}`);
        } catch (e) {
          toast.error(e.message);
        }
      }
      toast.success(wasIn ? 'Removed from wishlist' : 'Added to wishlist');
    },
    [ids, user]
  );

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
