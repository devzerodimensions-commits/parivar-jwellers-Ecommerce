import asyncHandler from '../middleware/asyncHandler.js';
import Settings from '../models/Settings.js';

// Live gold rate. If the admin has set a manual 24K rate (settings.goldRate),
// that wins. Otherwise we fetch the international gold price (USD/troy-oz) and
// the USD->INR rate from free, key-less public APIs, convert to INR per gram,
// and apply an India retail uplift (import duty + GST + premium). Cached so the
// sources are hit at most twice an hour; it auto-refreshes as the market moves.

const GRAMS_PER_OZ = 31.1034768;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
// India retail uplift over international spot: import duty (~6%) + GST (3%) + jeweller
// premium — tuned so the auto rate matches published Indian (Gujarat) 24K rates.
const INDIA_FACTOR = 1.152;

let cache = null; // { usdPerOz, usdInr, spot24k, prevSpot, fetchedAt, updatedAt }

async function fetchLiveRate() {
  const [goldRes, fxRes] = await Promise.all([
    fetch('https://api.gold-api.com/price/XAU'),
    fetch('https://api.frankfurter.app/latest?from=USD&to=INR'),
  ]);
  if (!goldRes.ok || !fxRes.ok) throw new Error('gold price source unavailable');

  const gold = await goldRes.json();
  const fx = await fxRes.json();
  const usdPerOz = Number(gold.price);
  const usdInr = Number(fx.rates?.INR);
  if (!usdPerOz || !usdInr) throw new Error('invalid price data');

  const spot24k = (usdPerOz * usdInr) / GRAMS_PER_OZ; // spot INR per gram, 24K
  return { usdPerOz, usdInr, spot24k };
}

function payload(rate24k, { trend, source, updatedAt }) {
  return {
    success: true,
    currency: 'INR',
    unit: 'gram',
    rate24k: Math.round(rate24k),
    rate22k: Math.round((rate24k * 22) / 24),
    rate18k: Math.round((rate24k * 18) / 24),
    trend,
    source,
    updatedAt,
  };
}

// @route GET /api/gold-price
export const getGoldPrice = asyncHandler(async (req, res) => {
  // 1) Manual rate set by the shop admin always wins.
  let manual = 0;
  try {
    const s = await Settings.getSingleton();
    manual = Number(s?.goldRate) || 0;
  } catch {
    /* ignore -> fall back to live */
  }
  if (manual > 0) {
    return res.json(payload(manual, { trend: 'up', source: 'manual', updatedAt: new Date().toISOString() }));
  }

  // 2) Otherwise: live rate + India adjustment (cached).
  const now = Date.now();
  if (!cache || now - cache.fetchedAt > CACHE_TTL_MS) {
    try {
      const fresh = await fetchLiveRate();
      const prevSpot = cache?.spot24k ?? fresh.spot24k;
      cache = { ...fresh, prevSpot, fetchedAt: now, updatedAt: new Date().toISOString() };
    } catch (err) {
      if (!cache) {
        res.status(503);
        throw new Error('Gold price is temporarily unavailable. Please try again shortly.');
      }
      // else serve stale cache
    }
  }

  const rate24k = cache.spot24k * INDIA_FACTOR;
  const trend = cache.spot24k >= cache.prevSpot ? 'up' : 'down';
  res.json(payload(rate24k, { trend, source: 'live', updatedAt: cache.updatedAt }));
});
