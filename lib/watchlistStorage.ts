// Client-side watchlist cache (localStorage). The server store is process
// memory when MongoDB is unconfigured, so a dev-server restart or full page
// reload would wipe the list. This module keeps the last-known list in the
// browser and lets hooks/useWatchlist seed React Query from it and re-push it
// to the server when the server comes back empty.

export interface WatchlistItem {
  coinId: string;
  addedAt: string;
}

const STORAGE_KEY = 'mp-watchlist-v1';

function isValidItem(value: unknown): value is WatchlistItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.coinId === 'string' && typeof item.addedAt === 'string';
}

export function loadWatchlist(): WatchlistItem[] | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed.filter(isValidItem);
  } catch {
    return undefined;
  }
}

export function saveWatchlist(items: WatchlistItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota / private mode — best effort only.
  }
}

export function clearWatchlist(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best effort only.
  }
}
