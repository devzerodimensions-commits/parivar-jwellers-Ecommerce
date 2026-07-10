import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaShoppingBag,
  FaRegHeart,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaThLarge,
} from 'react-icons/fa';
import api from '../../api/axios.js';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, logout, isAdmin } = useAuth();
  const settings = useSettings();

  const [categories, setCategories] = useState([]);
  const [term, setTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      setTerm('');
      setMobileOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-gold-700 ${
      isActive ? 'text-gold-700' : 'text-charcoal/80'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-white/95 backdrop-blur">
      <div className="container-page">
        {/* Top row */}
        <div className="flex items-center gap-4 py-4">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-16 w-auto object-contain md:h-20"
              />
            ) : (
              <span className="font-serif text-2xl font-bold tracking-wide text-gold-600">
                {settings.siteName}
              </span>
            )}
          </Link>

          {/* Search (desktop) */}
          <form onSubmit={onSearch} className="ml-auto hidden max-w-md flex-1 lg:flex">
            <div className="relative w-full">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search rings, necklaces, gold coins…"
                className="input pr-10"
              />
              <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-4 lg:ml-4">
            <Link to="/wishlist" className="relative" aria-label="Wishlist">
              <FaRegHeart size={20} />
              {wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>
            {!settings.enquiryMode && (
              <Link to="/cart" className="relative" aria-label="Cart">
                <FaShoppingBag size={20} />
                {count > 0 && <Badge>{count}</Badge>}
              </Link>
            )}

            {/* Account */}
            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                onBlur={() => setTimeout(() => setAccountOpen(false), 150)}
                className="flex items-center gap-1"
                aria-label="Account"
              >
                <FaUser size={19} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-charcoal/10 bg-white py-1 shadow-card">
                  {user ? (
                    <>
                      <div className="border-b border-charcoal/10 px-4 py-2 text-sm">
                        <p className="font-medium">{user.name}</p>
                        <p className="truncate text-xs text-charcoal/50">{user.email}</p>
                      </div>
                      <DropLink to="/account">My Account</DropLink>
                      <DropLink to="/account/orders">My Orders</DropLink>
                      {isAdmin && (
                        <DropLink to="/admin/dashboard">
                          <FaThLarge className="mr-2 inline" /> Admin Panel
                        </DropLink>
                      )}
                      <button
                        onClick={logout}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-cream"
                      >
                        <FaSignOutAlt className="mr-2 inline" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <DropLink to="/login">Login</DropLink>
                      <DropLink to="/register">Create account</DropLink>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category nav (desktop) */}
        <nav className="hidden items-center gap-7 pb-3 lg:flex">
          <NavLink to="/shop" className={navLinkClass}>
            All Jewellery
          </NavLink>
          {categories.map((c) => (
            <NavLink key={c._id} to={`/category/${c.slug}`} className={navLinkClass}>
              {c.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-charcoal/10 bg-white px-4 py-4 lg:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <div className="relative">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search…"
                className="input pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50">
                <FaSearch />
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-1">
            <MobileLink to="/shop" onClick={() => setMobileOpen(false)}>
              All Jewellery
            </MobileLink>
            {categories.map((c) => (
              <MobileLink key={c._id} to={`/category/${c.slug}`} onClick={() => setMobileOpen(false)}>
                {c.name}
              </MobileLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

const Badge = ({ children }) => (
  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold-600 px-1 text-[10px] font-semibold text-white">
    {children}
  </span>
);

const DropLink = ({ to, children }) => (
  <Link to={to} className="block px-4 py-2 text-sm hover:bg-cream">
    {children}
  </Link>
);

const MobileLink = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick} className="rounded px-2 py-2 text-sm font-medium hover:bg-cream">
    {children}
  </Link>
);

export default Navbar;
