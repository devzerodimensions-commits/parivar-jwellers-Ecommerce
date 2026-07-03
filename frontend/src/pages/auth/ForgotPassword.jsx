import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Seo from '../../components/ui/Seo.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState(null); // { message, delivered, resetUrl }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
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
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Seo title="Forgot Password" />
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-1 text-center font-serif text-3xl font-bold">Reset your password</h1>
        <p className="mb-6 text-center text-sm text-charcoal/50">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div className="space-y-3">
            <div className="rounded-md bg-green-50 p-4 text-center text-sm text-green-700">
              {result?.message || 'If that email is registered, a reset link is on its way.'}
            </div>
            {result?.resetUrl && (
              <a
                href={result.resetUrl}
                className="block break-all rounded-md border border-gold-200 bg-gold-50 p-3 text-center text-sm font-medium text-gold-800 hover:underline"
              >
                Continue to reset your password →
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button disabled={busy} className="btn-primary w-full">
              {busy ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-gold-700 hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
