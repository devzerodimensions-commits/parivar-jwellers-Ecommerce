import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { isAdminRole } from '../../config/roles.js';
import { AuthCard, AuthField, AuthSubmit } from '../../components/auth/AuthUI.jsx';

/**
 * Admin login (inside the shared AuthLayout — no website chrome).
 * Two steps: credentials → optional two-factor code.
 */
const AdminLogin = () => {
  const { login, verifyTwoFactor, logout, user, isAdmin, loading } = useAuth();
  const settings = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [twoFactor, setTwoFactor] = useState(null); // { method, challenge }
  const [code, setCode] = useState('');

  // Already signed in as an admin? Skip the form.
  useEffect(() => {
    if (!loading && user && isAdmin) navigate('/admin/dashboard', { replace: true });
  }, [loading, user, isAdmin, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Shared "we now have a full session" handler — enforce admin-area access.
  const finishLogin = async (signedInUser) => {
    if (!isAdminRole(signedInUser.role)) {
      await logout();
      toast.error('This account does not have admin access.');
      setTwoFactor(null);
      setCode('');
      return;
    }
    toast.success('Welcome back.');
    navigate('/admin/dashboard', { replace: true });
  };

  const submitCredentials = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await login(form.email, form.password);
      if (result.requires2FA) {
        setTwoFactor({ method: result.method, challenge: result.challenge });
        toast.success(
          result.method === 'app'
            ? 'Enter the code from your authenticator app.'
            : 'We emailed you a 6-digit code.'
        );
      } else {
        await finishLogin(result.user);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const signedInUser = await verifyTwoFactor(twoFactor.challenge, code.trim());
      await finishLogin(signedInUser);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const backToCredentials = () => {
    setTwoFactor(null);
    setCode('');
  };

  if (loading) {
    return (
      <AuthCard title="Admin Login">
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-200 border-t-gold-600" />
        </div>
      </AuthCard>
    );
  }

  // ---- Step 2: two-factor code ----
  if (twoFactor) {
    return (
      <AuthCard
        title="Two-Factor Verification"
        subtitle={
          twoFactor.method === 'app'
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Enter the 6-digit code we emailed you.'
        }
      >
        <Helmet>
          <title>Verify | {settings.siteName || 'Parivar Jewellers'}</title>
        </Helmet>

        <form onSubmit={submitCode} className="space-y-4">
          <AuthField
            id="admin-2fa-code"
            label="Verification code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            icon={<FaShieldAlt />}
          />
          <AuthSubmit disabled={busy || code.length < 6}>
            {busy ? 'Verifying…' : 'Verify & Sign In'}
          </AuthSubmit>
        </form>

        <p className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={backToCredentials}
            className="inline-flex items-center gap-1.5 font-medium text-gold-700 hover:underline"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
        </p>
      </AuthCard>
    );
  }

  // ---- Step 1: credentials ----
  return (
    <AuthCard title="Admin Login" subtitle="Sign in to manage your store">
      <Helmet>
        <title>Admin Login | {settings.siteName || 'Parivar Jewellers'}</title>
      </Helmet>

      <form onSubmit={submitCredentials} className="space-y-4">
        <AuthField
          id="admin-email"
          label="Email"
          type="email"
          autoComplete="username"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com"
          icon={<FaEnvelope />}
        />

        <AuthField
          id="admin-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          icon={<FaLock />}
          action={
            <Link to="/admin/forgot-password" className="text-xs font-medium text-gold-700 hover:underline">
              Forgot password?
            </Link>
          }
        />

        <AuthSubmit disabled={busy}>{busy ? 'Signing in…' : 'Log In'}</AuthSubmit>
      </form>
    </AuthCard>
  );
};

export default AdminLogin;
