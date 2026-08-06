// Shared formatting helpers (price display used by CoinCard, CoinDetailView,
// WatchlistView). Keeps currency formatting consistent across surfaces.

export function formatPrice(price: number): string {
  const fractionDigits =
    price >= 1000 ? 0 : price >= 1 ? 2 : price >= 0.01 ? 4 : 6;
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(2, fractionDigits),
    maximumFractionDigits: fractionDigits,
  });
}
