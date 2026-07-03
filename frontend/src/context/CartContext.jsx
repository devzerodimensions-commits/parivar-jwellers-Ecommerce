import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { effectivePrice } from '../utils/format.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'jewelly_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // A cart line is keyed by product id + chosen variant.
  const lineKey = (productId, variant) => `${productId}::${variant || ''}`;

  const addItem = (product, quantity = 1, variant = '') => {
    setItems((prev) => {
      const key = lineKey(product._id, variant);
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock || 99) } : i
        );
      }
      return [
        ...prev,
        {
          key,
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0]?.url,
          price: effectivePrice(product),
          stock: product.stock,
          variant,
          quantity,
        },
      ];
    });
    toast.success('Added to cart');
  };

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clearCart = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.count += i.quantity;
        acc.subtotal += i.price * i.quantity;
        return acc;
      },
      { count: 0, subtotal: 0 }
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
