import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useSettings } from '../context/SettingsContext.jsx';
import Seo from '../components/ui/Seo.jsx';

const inr = (n) => Number(n || 0).toLocaleString('en-IN');

// Full-screen public gold-rate board — designed to be shown on a screen/TV in
// the showroom. Live rates auto-refresh every few minutes. URL: /gold-rate
const GoldRateDisplay = () => {
  const settings = useSettings();
  const [data, setData] = useState(null);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const load = () => api.get('/gold-price').then((r) => setData(r.data)).catch(() => {});
    load();
    const rateTimer = setInterval(load, 5 * 60 * 1000); // refresh rate every 5 min
    const clockTimer = setInterval(() => setClock(new Date()), 30 * 1000);
    return () => {
      clearInterval(rateTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const karats = data
    ? [
        { k: '24K', label: '999 Fine Gold', v: data.rate24k },
        { k: '22K', label: '916 Hallmark', v: data.rate22k },
        { k: '18K', label: '750 Gold', v: data.rate18k },
      ]
    : [];

  const dateStr = clock.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen flex-col overflow-y-auto bg-gradient-to-b from-[#1c1c1c] via-charcoal to-black text-cream sm:h-screen sm:overflow-hidden">
      <Seo title="Today's Gold Rate" description={`Today's live gold rate at ${settings.siteName}.`} />

      {/* Brand */}
      <header className="flex flex-col items-center gap-2 px-6 pt-5 text-center md:pt-8">
        {settings.logo ? (
          <div className="inline-block rounded-2xl bg-cream px-8 py-5 shadow-2xl ring-1 ring-gold-400/20">
            <img src={settings.logo} alt={settings.siteName} className="h-20 w-auto object-contain md:h-28" />
          </div>
        ) : (
          <h2 className="font-serif text-4xl font-bold text-gold-400 md:text-5xl">{settings.siteName}</h2>
        )}
      </header>

      {/* Rates */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-500 sm:text-sm md:text-base">
          Today&apos;s Gold Rate
        </p>
        <p className="mt-2 text-cream/50 md:text-xl">{dateStr}</p>

        <div className="mt-6 grid w-full max-w-6xl gap-5 sm:grid-cols-3 md:mt-8 md:gap-8">
          {karats.map((r) => (
            <div
              key={r.k}
              className="rounded-2xl border border-gold-500/30 bg-gradient-to-b from-gold-500/10 to-transparent p-5 text-center backdrop-blur md:p-8"
            >
              <p className="font-serif text-4xl font-bold text-gold-400 md:text-6xl">{r.k}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-cream/40 md:text-xs">{r.label}</p>
              <p className="mt-4 text-4xl font-bold md:mt-6 md:text-6xl">₹{inr(r.v)}</p>
              <p className="text-xs text-cream/40 md:text-sm">per gram</p>
              <p className="mt-3 text-lg text-gold-300/90 md:text-2xl">
                ₹{inr(r.v * 10)} <span className="text-xs text-cream/40 md:text-sm">/ 10 g</span>
              </p>
            </div>
          ))}
        </div>

        {!data && <p className="mt-10 text-cream/40">Loading live rate…</p>}

        {data && (
          <div className="mt-6 flex items-center gap-2 text-sm text-cream/45 md:mt-8 md:text-base">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            {data.source === 'manual' ? 'Store rate' : 'Live rate'}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-5 text-center text-xs text-cream/45 sm:text-sm">
        <p className="font-serif text-base text-gold-400 md:text-lg">{settings.siteName}</p>
        {settings.contact?.address && <p className="mt-1">{settings.contact.address}</p>}
        {settings.contact?.phone && <p className="mt-0.5">📞 {settings.contact.phone}</p>}
      </footer>
    </div>
  );
};

export default GoldRateDisplay;
