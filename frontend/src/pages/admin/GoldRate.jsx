import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCoins, FaArrowUp, FaArrowDown, FaSync } from 'react-icons/fa';
import api from '../../api/axios.js';
import Spinner from '../../components/ui/Spinner.jsx';

const inr = (n) => Number(n || 0).toLocaleString('en-IN');

const AdminGoldRate = () => {
  const [rate, setRate] = useState(null);
  const [manual, setManual] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadRate = () => api.get('/gold-price').then((r) => setRate(r.data)).catch(() => {});

  useEffect(() => {
    Promise.all([
      loadRate(),
      api.get('/settings').then((r) => setManual(r.data.settings.goldRate || '')).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const save = async (value) => {
    setSaving(true);
    try {
      await api.put('/settings', { goldRate: Number(value) || 0 });
      toast.success(Number(value) > 0 ? 'Manual rate saved.' : 'Switched to automatic live rate.');
      await loadRate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadRate();
    setRefreshing(false);
  };

  if (loading) return <Spinner />;

  const isManual = rate?.source === 'manual';
  const up = rate?.trend === 'up';
  const Trend = up ? FaArrowUp : FaArrowDown;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
          <FaCoins className="text-gold-600" /> Gold Rate
        </h1>
        <button onClick={refresh} disabled={refreshing} className="btn-outline">
          <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Current rates */}
      <div className="card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-xl">
            Today&apos;s Rate <span className="text-sm font-normal text-charcoal/40">(per gram)</span>
          </h2>
          <span
            className={`badge inline-flex items-center gap-1 ${
              isManual ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {isManual ? 'Manual rate' : 'Live · auto'}
            {!isManual && <Trend className="text-[9px]" />}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['24K', rate.rate24k],
            ['22K', rate.rate22k],
            ['18K', rate.rate18k],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">{k}</p>
              <p className="mt-1 text-3xl font-bold text-gold-800">₹{inr(v)}</p>
              <p className="text-xs text-charcoal/40">per gram</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-charcoal/40">
          {isManual
            ? 'Showing your manually set rate.'
            : 'Auto-updates every 15 minutes from the live international market (incl. India duty/GST).'}
          {rate?.updatedAt && ` · Updated ${new Date(rate.updatedAt).toLocaleString('en-IN')}`}
        </p>
      </div>

      {/* Manual override */}
      <div className="card p-6">
        <h2 className="mb-1 font-serif text-xl">Set Your Own Rate</h2>
        <p className="mb-4 max-w-2xl text-sm text-charcoal/55">
          Enter your shop&apos;s <strong>24K rate (₹ per gram)</strong> to show it across the website. 22K &amp; 18K
          are calculated automatically. Leave blank / 0 to use the automatic live rate.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">24K Rate (₹ per gram)</label>
            <input
              type="number"
              min="0"
              className="input w-56"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Auto (live rate)"
            />
          </div>
          <button onClick={() => save(manual)} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Rate'}
          </button>
          {Number(manual) > 0 && (
            <button
              type="button"
              onClick={() => {
                setManual('');
                save(0);
              }}
              disabled={saving}
              className="btn-outline"
            >
              Use automatic
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGoldRate;
