import { useEffect, useState } from 'react';
import { FaCoins, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import api from '../../api/axios.js';

const inr = (n) => Number(n).toLocaleString('en-IN');

// Slim strip showing today's live gold rate (auto-refreshes every 10 minutes).
const GoldRate = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .get('/gold-price')
        .then((res) => active && setData(res.data))
        .catch(() => {});
    load();
    const id = setInterval(load, 10 * 60 * 1000); // refresh every 10 min
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!data) return null;
  const up = data.trend === 'up';
  const Arrow = up ? FaArrowUp : FaArrowDown;

  return (
    <div className="border-b border-gold-200/70 bg-gold-50 text-charcoal">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-5 gap-y-0.5 py-1.5 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-gold-800">
          <FaCoins className="text-gold-600" /> Today&apos;s Gold Rate
        </span>
        <span className="inline-flex items-baseline gap-1">
          <span className="text-charcoal/55">24K</span>
          <b className="text-gold-800">₹{inr(data.rate24k)}</b>
          <span className="text-charcoal/45">/g</span>
        </span>
        <span className="inline-flex items-baseline gap-1">
          <span className="text-charcoal/55">22K</span>
          <b className="text-gold-800">₹{inr(data.rate22k)}</b>
          <span className="text-charcoal/45">/g</span>
        </span>
        <span
          className={`inline-flex items-center gap-1 ${up ? 'text-green-600' : 'text-red-500'}`}
          title="Trend since last update"
        >
          <Arrow className="text-[10px]" />
        </span>
        <span className="hidden text-charcoal/40 sm:inline">• Live rate</span>
      </div>
    </div>
  );
};

export default GoldRate;
