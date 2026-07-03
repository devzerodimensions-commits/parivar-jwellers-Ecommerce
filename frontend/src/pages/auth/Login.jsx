import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Seo from '../../components/ui/Seo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const Login = () => {
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [twoFactor, setTwoFactor] = useState(null); // { method, challenge }
  const [code, setCode] = useState('');

  const goAfterLogin = (user) => {
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    navigate(user.role === 'admin' ? '/admin/dashboard' : from, { replace: true });
  };

  const submit = async (e) => {
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
        goAfterLogin(result.user);
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
      const user = await verifyTwoFactor(twoFactor.challenge, code.trim());
      goAfterLogin(user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Seo title="Login" />
      <div className="card w-full max-w-md p-8">
        {twoFactor ? (
          <>
            <h1 className="mb-1 text-center font-serif text-3xl font-bold">Two-Factor Verification</h1>
            <p className="mb-6 text-center text-sm text-charcoal/50">
              {twoFactor.method === 'app'
                ? 'Enter the 6-digit code from your authenticator app.'
                : 'Enter the 6-digit code we emailed you.'}
            </p>
            <form onSubmit={submitCode} className="space-y-4">
              <div>
                <label className="label">Verification code</label>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="input tracking-[0.5em]"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                />
              </div>
              <button disabled={busy || code.length < 6} className="btn-primary w-full">
                {busy ? 'Verifying…' : 'Verify & Sign In'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={() => { setTwoFactor(null); setCode(''); }}
                className="text-gold-700 hover:underline"
              >
                ← Back
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-center font-serif text-3xl font-bold">Welcome back</h1>
            <p className="mb-6 text-center text-sm text-charcoal/50">Log in to your account</p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Password</label>
                  <Link to="/forgot-password" className="text-xs text-gold-700 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
                  >
                    {showPw ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button disabled={busy} className="btn-primary w-full">
                {busy ? 'Logging in…' : 'Log In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-charcoal/60">
              New here?{' '}
              <Link to="/register" className="font-medium text-gold-700 hover:underline">
                Create an account
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
