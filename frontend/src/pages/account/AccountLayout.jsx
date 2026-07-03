import { NavLink, Outlet } from 'react-router-dom';
import { FaUser, FaBoxOpen, FaMapMarkerAlt, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import Seo from '../../components/ui/Seo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/account', label: 'Profile', icon: <FaUser />, end: true },
  { to: '/account/orders', label: 'My Orders', icon: <FaBoxOpen /> },
  { to: '/account/addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> },
  { to: '/wishlist', label: 'Wishlist', icon: <FaHeart /> },
];

const AccountLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container-page py-8">
      <Seo title="My Account" />
      <h1 className="mb-6 font-serif text-3xl font-bold">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit card p-3">
          <div className="border-b border-charcoal/10 px-3 py-3">
            <p className="font-medium">{user?.name}</p>
            <p className="truncate text-xs text-charcoal/50">{user?.email}</p>
          </div>
          <nav className="mt-2 space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                    isActive ? 'bg-gold-50 text-gold-800' : 'text-charcoal/70 hover:bg-cream'
                  }`
                }
              >
                {l.icon} {l.label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-cream"
            >
              <FaSignOutAlt /> Logout
            </button>
          </nav>
        </aside>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
