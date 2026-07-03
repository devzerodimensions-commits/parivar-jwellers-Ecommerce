import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FaEnvelope } from 'react-icons/fa';
import api from '../../api/axios.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { AuthCard, AuthField, AuthSubmit, AuthBackLink } from '../../components/auth/AuthUI.jsx';

/**
 * Admin "forgot password" — same standalone AuthLayout as the login page.
 * Uses the existing /auth/forgot-password API (unchanged).
 */
const AdminForgotPassword = () => {
  const settings = useSettings();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState(null); // { message, delivered, resetUrl }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/auth/forgot-password', { email, context: 'admin' });
      setResult(res.data);
      toast.success(res.data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle={sent ? undefined : "Enter your email and we'll send you a reset link."}
    >
      <Helmet>
        <title>Reset Password | {settings.siteName || 'Parivar Jewellers'}</title>
      </Helmet>

      {sent ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
            {result?.message || 'If that email is registered, a reset link is on its way.'}
          </div>
          {result?.resetUrl && (
            <a
              href={result.resetUrl}
              className="block break-all rounded-lg border border-gold-200 bg-gold-50 p-3 text-center text-sm font-medium text-gold-800 hover:underline"
            >
              Continue to reset your password →
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <AuthField
            id="admin-forgot-email"
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<FaEnvelope />}
          />
          <AuthSubmit disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</AuthSubmit>
        </form>
      )}

      <AuthBackLink to="/admin/login" />
    </AuthCard>
  );
};

export default AdminForgotPassword;
