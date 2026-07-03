import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaShieldAlt, FaEnvelope, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../api/axios.js';

/**
 * Enable / disable Two-Factor Authentication from account settings.
 * Supports email OTP and authenticator-app (TOTP with QR). Backend unchanged
 * endpoints under /auth/2fa/*.
 */
const TwoFactorSettings = () => {
  const [status, setStatus] = useState(null); // { enabled, method }
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [appSetup, setAppSetup] = useState(null); // { qr, secret }
  const [code, setCode] = useState('');
  const [disarming, setDisarming] = useState(false);
  const [password, setPassword] = useState('');

  const load = () =>
    api
      .get('/auth/2fa')
      .then((r) => setStatus({ enabled: r.data.enabled, method: r.data.method }))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const enableEmail = async () => {
    setBusy(true);
    try {
      await api.post('/auth/2fa/email/enable');
      toast.success('Email two-factor enabled.');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startApp = async () => {
    setBusy(true);
    try {
      const r = await api.post('/auth/2fa/app/setup');
      setAppSetup({ qr: r.data.qr, secret: r.data.secret });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const verifyApp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/2fa/app/verify', { code: code.trim() });
      toast.success('Authenticator app enabled.');
      setAppSetup(null);
      setCode('');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const disable = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/2fa/disable', { password });
      toast.success('Two-factor authentication disabled.');
      setPassword('');
      setDisarming(false);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-xl">
          <FaShieldAlt className="text-gold-600" /> Two-Factor Authentication
        </h2>
        {status?.enabled ? (
          <span className="badge bg-green-100 text-green-700">On</span>
        ) : (
          <span className="badge bg-charcoal/10 text-charcoal/60">Off</span>
        )}
      </div>
      <p className="mt-1 text-sm text-charcoal/60">
        Add a second step at login using a code from your email or an authenticator app.
      </p>

      {/* ---- Enabled ---- */}
      {status?.enabled && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm text-charcoal/80">
            <FaCheckCircle className="text-green-600" />
            Enabled via{' '}
            <strong>{status.method === 'app' ? 'authenticator app' : 'email code'}</strong>
          </p>
          {disarming ? (
            <form onSubmit={disable} className="mt-4 flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="label">Confirm your password to disable</label>
                <input
                  type="password"
                  className="input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button disabled={busy} className="btn bg-red-600 text-white hover:bg-red-700">
                {busy ? 'Disabling…' : 'Disable 2FA'}
              </button>
              <button type="button" onClick={() => setDisarming(false)} className="btn-outline">
                Cancel
              </button>
            </form>
          ) : (
            <button onClick={() => setDisarming(true)} className="btn-outline mt-4">
              Disable 2FA
            </button>
          )}
        </div>
      )}

      {/* ---- Disabled: choose a method ---- */}
      {!status?.enabled && !appSetup && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button onClick={enableEmail} disabled={busy} className="btn-outline justify-start gap-3 py-3">
            <FaEnvelope className="text-gold-600" />
            <span className="text-left">
              <span className="block font-medium">Email code</span>
              <span className="block text-xs text-charcoal/50">Codes sent to your email</span>
            </span>
          </button>
          <button onClick={startApp} disabled={busy} className="btn-outline justify-start gap-3 py-3">
            <FaMobileAlt className="text-gold-600" />
            <span className="text-left">
              <span className="block font-medium">Authenticator app</span>
              <span className="block text-xs text-charcoal/50">Google Authenticator, Authy…</span>
            </span>
          </button>
        </div>
      )}

      {/* ---- App setup: scan QR + confirm ---- */}
      {appSetup && (
        <form onSubmit={verifyApp} className="mt-5 rounded-lg border border-charcoal/10 p-4">
          <p className="text-sm font-medium">1. Scan this QR code in your authenticator app</p>
          <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <img src={appSetup.qr} alt="2FA QR code" className="h-40 w-40 rounded border border-charcoal/10" />
            <div className="text-sm text-charcoal/60">
              <p>Or enter this key manually:</p>
              <code className="mt-1 block break-all rounded bg-cream px-2 py-1 font-mono text-xs">
                {appSetup.secret}
              </code>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium">2. Enter the 6-digit code to confirm</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              inputMode="numeric"
              maxLength={6}
              className="input max-w-[160px] tracking-[0.4em]"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
            />
            <button disabled={busy || code.length < 6} className="btn-primary">
              {busy ? 'Verifying…' : 'Verify & Enable'}
            </button>
            <button type="button" onClick={() => { setAppSetup(null); setCode(''); }} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default TwoFactorSettings;
