import { useState } from 'react';
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
  FaChevronDown,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { MEGA_MENU, menuLink } from '../../config/megaMenu.js';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors hover:text-gold-700 ${
    isActive ? 'text-gold-700' : 'text-charcoal/80'
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, logout, isAdmin } = useAuth();
  const settings = useSettings();

  const [term, setTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      setTerm('');
      setMobileOpen(false);
    }
  };

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

        {/* Category mega-menu (desktop) */}
        <nav className="hidden items-center gap-6 pb-3 lg:flex">
          <NavLink to="/shop" className={navLinkClass}>
            All Jewellery
          </NavLink>
          {MEGA_MENU.map((group) => (
            <MegaGroup key={group.title} group={group} />
          ))}
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-charcoal/10 bg-white px-4 py-4 lg:hidden">
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
          <Link
            to="/shop"
            onClick={() => setMobileOpen(false)}
            className="block rounded px-2 py-2 text-sm font-semibold hover:bg-cream"
          >
            All Jewellery
          </Link>
          {MEGA_MENU.map((group) => (
            <MobileGroup key={group.title} group={group} onNavigate={() => setMobileOpen(false)} />
          ))}
        </div>
      )}
    </header>
  );
};

// Desktop: a nav label that reveals a dropdown panel of its items on hover.
const MegaGroup = ({ group }) => {
  const [open, setOpen] = useState(false);
  const colClass =
    group.cols === 3 ? 'grid-cols-3' : group.cols === 2 ? 'grid-cols-2' : 'grid-cols-1';
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-medium text-charcoal/80 transition-colors hover:text-gold-700">
        {group.title}
        <FaChevronDown className="text-[9px] opacity-70" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <div className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-card">
            <p className="mb-3 border-b border-charcoal/10 pb-2 text-xs font-semibold uppercase tracking-wide text-gold-700">
              {group.title}
            </p>
            <ul className={`grid gap-x-8 gap-y-2 ${colClass}`}>
              {group.items.map((item) => (
                <li key={item}>
                  <Link
                    to={menuLink(item)}
                    className="block whitespace-nowrap text-sm text-charcoal/75 transition-colors hover:text-gold-700"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile: an expandable accordion group.
const MobileGroup = ({ group, onNavigate }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-charcoal/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-2 py-2.5 text-sm font-semibold"
      >
        {group.title}
        <FaChevronDown className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 pb-2 pl-2">
          {group.items.map((item) => (
            <li key={item}>
              <Link
                to={menuLink(item)}
                onClick={onNavigate}
                className="block py-1 text-sm text-charcoal/70 hover:text-gold-700"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
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

export default Navbar;
