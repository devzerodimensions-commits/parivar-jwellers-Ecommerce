import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  FaThLarge,
  FaBoxOpen,
  FaTags,
  FaCopyright,
  FaShoppingCart,
  FaUsers,
  FaTicketAlt,
  FaImages,
  FaPenNib,
  FaStar,
  FaCog,
  FaStore,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronDown,
  FaThList,
  FaPhotoVideo,
  FaEnvelopeOpenText,
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

// Sidebar structure: single links + expandable groups (dropdowns). Each entry
// carries a `cap` — the section capability required to see it.
const NAV = [
  { type: 'link', to: '/admin/dashboard', label: 'Dashboard', icon: <FaThLarge />, end: true, cap: 'dashboard' },
  {
    type: 'group',
    key: 'catalog',
    label: 'Products',
    icon: <FaBoxOpen />,
    children: [
      { to: '/admin/products', label: 'All Products', icon: <FaThList />, cap: 'catalog' },
      { to: '/admin/categories', label: 'Categories', icon: <FaTags />, cap: 'catalog' },
      { to: '/admin/brands', label: 'Brands', icon: <FaCopyright />, cap: 'catalog' },
    ],
  },
  {
    type: 'group',
    key: 'sales',
    label: 'Sales',
    icon: <FaShoppingCart />,
    children: [
      { to: '/admin/orders', label: 'Orders', icon: <FaShoppingCart />, cap: 'orders', hideInEnquiryMode: true },
      { to: '/admin/coupons', label: 'Coupons', icon: <FaTicketAlt />, cap: 'coupons', hideInEnquiryMode: true },
      { to: '/admin/enquiries', label: 'Enquiries', icon: <FaEnvelopeOpenText />, cap: 'enquiries' },
    ],
  },
  {
    type: 'group',
    key: 'content',
    label: 'Content',
    icon: <FaImages />,
    children: [
      { to: '/admin/banners', label: 'Banners', icon: <FaImages />, cap: 'banners' },
      { to: '/admin/blog', label: 'Blog', icon: <FaPenNib />, cap: 'blog' },
      { to: '/admin/reviews', label: 'Reviews', icon: <FaStar />, cap: 'reviews' },
    ],
  },
  { type: 'link', to: '/admin/media', label: 'Media', icon: <FaPhotoVideo />, cap: 'media' },
  { type: 'link', to: '/admin/users', label: 'Users', icon: <FaUsers />, cap: 'users' },
  { type: 'link', to: '/admin/settings', label: 'Settings', icon: <FaCog />, cap: 'settings' },
];

const AdminLayout = () => {
  const { user, logout, can } = useAuth();
  const settings = useSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const siteName = settings.siteName || 'Parivar Jewellers';

  // Show only the sections this role can access.
  const nav = NAV
    .map((item) =>
      item.type === 'group'
        ? {
            ...item,
            children: item.children.filter(
              (c) => can(c.cap) && !(settings.enquiryMode && c.hideInEnquiryMode)
            ),
          }
        : item
    )
    .filter((item) => (item.type === 'group' ? item.children.length > 0 : can(item.cap)))
    // A group left with a single item is shown as a plain top-level link (no redundant dropdown).
    .map((item) =>
      item.type === 'group' && item.children.length === 1
        ? { type: 'link', ...item.children[0] }
        : item
    );

  // Which group contains the active route?
  const activeGroupKey = nav.find(
    (n) => n.type === 'group' && n.children.some((c) => pathname.startsWith(c.to))
  )?.key;

  // Accordion state — keep the active group expanded.
  const [openKey, setOpenKey] = useState(activeGroupKey || 'catalog');
  useEffect(() => {
    if (activeGroupKey) setOpenKey(activeGroupKey);
  }, [activeGroupKey]);

  const closeMobile = () => setOpen(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
      isActive ? 'bg-gold-600 text-white' : 'text-cream/70 hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <Helmet>
        <title>Admin · {siteName}</title>
      </Helmet>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-charcoal text-cream transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link to="/admin/dashboard" className="font-serif text-2xl font-bold leading-tight text-gold-400">
            {siteName}
          </Link>
          <button className="lg:hidden" onClick={closeMobile} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="mt-2 space-y-1 px-3 pb-6">
          {nav.map((item) => {
            if (item.type === 'link') {
              return (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={closeMobile} className={linkClass}>
                  {item.icon} {item.label}
                </NavLink>
              );
            }

            // Expandable group
            const isOpen = openKey === item.key;
            const groupActive = item.children.some((c) => pathname.startsWith(c.to));
            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? null : item.key)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    groupActive ? 'text-gold-300' : 'text-cream/70 hover:bg-white/10'
                  }`}
                  aria-expanded={isOpen}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <FaChevronDown
                    className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Children dropdown */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? 'max-h-60' : 'max-h-0'
                  }`}
                >
                  <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        onClick={closeMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive ? 'bg-gold-600 text-white' : 'text-cream/60 hover:bg-white/10 hover:text-cream'
                          }`
                        }
                      >
                        <span className="text-xs">{c.icon}</span> {c.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-charcoal/10 bg-white px-4 py-3">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <FaBars size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4 text-sm">
            {/* Opens the storefront in a new tab */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-charcoal/70 hover:text-gold-700"
            >
              <FaStore /> View Store
            </a>
            <span className="text-charcoal/40">|</span>
            <span className="font-medium">{user?.name}</span>
            <button onClick={logout} className="text-red-600 hover:text-red-700" aria-label="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={closeMobile} />}
    </div>
  );
};

export default AdminLayout;
