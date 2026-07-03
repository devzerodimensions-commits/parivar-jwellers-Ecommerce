import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaGem } from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext.jsx';

/**
 * Shared layout for ALL admin authentication pages (login, forgot password,
 * reset password, …). Rendered as a React Router layout route so navigating
 * between auth pages only swaps the <Outlet> card — the background and logo
 * stay mounted (no flash / layout shift).
 *
 * Intentionally standalone: it never renders the public Header, Navbar, Footer,
 * Announcement Bar or any customer-facing component.
 */
const AuthLayout = () => {
  const settings = useSettings();
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md">
        {/* Company logo */}
        <div className="mb-6 flex justify-center">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.siteName} className="h-10 w-auto" />
          ) : (
            <span className="flex items-center gap-2 font-serif text-3xl font-bold text-gold-600">
              <FaGem className="text-gold-500" /> {settings.siteName || 'Parivar Jewellers'}
            </span>
          )}
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
