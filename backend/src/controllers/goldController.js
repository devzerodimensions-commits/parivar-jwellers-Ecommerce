import asyncHandler from '../middleware/asyncHandler.js';

// Live gold rate: fetches the international gold price (USD/troy-oz) and the
// USD->INR rate from free, key-less public APIs, then converts to INR per gram
// for 24K / 22K / 18K. Cached in memory so we hit the sources at most twice an
// hour; the value auto-refreshes as the market moves.

const GRAMS_PER_OZ = 31.1034768;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

let cache = null; // { usdPerOz, usdInr, rate24k, prev24k, fetchedAt, updatedAt }

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

  const rate24k = (usdPerOz * usdInr) / GRAMS_PER_OZ; // INR per gram, 24K
  return { usdPerOz, usdInr, rate24k };
}

// @route GET /api/gold-price
export const getGoldPrice = asyncHandler(async (req, res) => {
  const now = Date.now();

  if (!cache || now - cache.fetchedAt > CACHE_TTL_MS) {
    try {
      const fresh = await fetchLiveRate();
      const prev24k = cache?.rate24k ?? fresh.rate24k;
      cache = { ...fresh, prev24k, fetchedAt: now, updatedAt: new Date().toISOString() };
    } catch (err) {
      // No cache to fall back on -> report unavailable; otherwise serve stale.
      if (!cache) {
        res.status(503);
        throw new Error('Gold price is temporarily unavailable. Please try again shortly.');
      }
    }
  }

  const r24 = cache.rate24k;
  res.json({
    success: true,
    currency: 'INR',
    unit: 'gram',
    rate24k: Math.round(r24),
    rate22k: Math.round((r24 * 22) / 24),
    rate18k: Math.round((r24 * 18) / 24),
    trend: r24 >= cache.prev24k ? 'up' : 'down',
    updatedAt: cache.updatedAt,
  });
});
