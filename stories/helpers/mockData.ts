import type { Coin } from '@/lib/coingecko';

// Deterministic pseudo-random generator so stories stay visually stable
// across reloads (seeded, not Math.random).
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random-walk sparkline series, oldest → newest. */
export function makeSparkline(count: number, start: number, drift: number, seed: number): number[] {
  const rng = seededRandom(seed);
  const step = drift / (count || 1);
  let value = start;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(value);
    value = value * (1 + step + (rng() - 0.5) * Math.abs(step) * 4);
  }
  return out;
}

/** [timestampMs, price][] series for PriceChart, oldest → newest. */
export function makeChartPrices(
  days: number,
  start = 62000,
  volatility = 0.02,
  seed = 42,
): [number, number][] {
  const stepMs = days <= 1 ? 15 * 60_000 : days <= 7 ? 3 * 3_600_000 : 6 * 3_600_000;
  const count = Math.floor((days * 86_400_000) / stepMs);
  const rng = seededRandom(seed);
  const now = Date.now();
  const out: [number, number][] = [];
  let price = start;
  for (let i = 0; i <= count; i++) {
    const t = now - (count - i) * stepMs;
    out.push([t, price]);
    const wiggle = i === count ? 0.004 : (rng() - 0.48) * volatility;
    price = price * (1 + wiggle);
  }
  return out;
}

const BTC_IMAGE = 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png';

export function mockCoin(overrides: Partial<Coin> = {}): Coin {
  return {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: BTC_IMAGE,
    current_price: 64520.31,
    market_cap: 1272000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.34,
    sparkline_in_7d: { price: makeSparkline(48, 62000, 0.04, 7) },
    ...overrides,
  };
}
