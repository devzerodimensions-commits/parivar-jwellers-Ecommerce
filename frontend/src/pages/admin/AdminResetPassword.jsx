import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FaLock } from 'react-icons/fa';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { AuthCard, AuthField, AuthSubmit, AuthBackLink } from '../../components/auth/AuthUI.jsx';

/**
 * Admin "set a new password" — same standalone AuthLayout as the login page.
 * Uses the existing /auth/reset-password/:token API (unchanged).
 */
const AdminResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const settings = useSettings();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setBusy(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password: form.password });
      localStorage.setItem('jewelly_token', res.data.token);
      updateUser(res.data.user);
      toast.success('Password reset successfully.');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your admin account.">
      <Helmet>
        <title>Set New Password | {settings.siteName || 'Parivar Jewellers'}</title>
      </Helmet>

      <form onSubmit={submit} className="space-y-4">
        <AuthField
          id="admin-new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          icon={<FaLock />}
        />
        <AuthField
          id="admin-confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm}
          onChange={set('confirm')}
          placeholder="••••••••"
          icon={<FaLock />}
        />
        <AuthSubmit disabled={busy}>{busy ? 'Resetting…' : 'Reset Password'}</AuthSubmit>
      </form>

      <AuthBackLink to="/admin/login" />
    </AuthCard>
  );
};

export default AdminResetPassword;
