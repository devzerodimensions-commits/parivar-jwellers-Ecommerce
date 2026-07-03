import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Seo from '../../components/ui/Seo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setBusy(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password: form.password });
      localStorage.setItem('jewelly_token', res.data.token);
      updateUser(res.data.user);
      toast.success('Password reset! You are now logged in.');
      navigate('/account', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Seo title="Reset Password" />
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-6 text-center font-serif text-3xl font-bold">Set a new password</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              className="input"
              required
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            />
          </div>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-gold-700 hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
