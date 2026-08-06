// Watchlist API client — calls the local route handlers (server data lives in
// React Query; this is the equivalent of lib/coingecko.ts for watchlist reads).

export interface WatchlistItem {
  coinId: string;
  addedAt: string;
}

const API_BASE = '/api/watchlist';

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Watchlist request failed: ${response.status}`);
  }
  return response;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const response = await request('');
  return response.json();
}

export async function addToWatchlist(coinId: string): Promise<WatchlistItem[]> {
  const response = await request('', {
    method: 'POST',
    body: JSON.stringify({ coinId }),
  });
  return response.json();
}

export async function removeFromWatchlist(coinId: string): Promise<WatchlistItem[]> {
  const response = await request(`/${encodeURIComponent(coinId)}`, {
    method: 'DELETE',
  });
  return response.json();
}
