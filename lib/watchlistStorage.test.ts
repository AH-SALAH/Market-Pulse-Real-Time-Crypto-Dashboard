import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadWatchlist,
  saveWatchlist,
  clearWatchlist,
  type WatchlistItem,
} from './watchlistStorage';

function createStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  };
}

beforeEach(() => {
  const storage = createStorage();
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: storage },
    configurable: true,
  });
});

describe('watchlistStorage', () => {
  it('round-trips saved items', () => {
    const items: WatchlistItem[] = [
      { coinId: 'bitcoin', addedAt: '2026-01-01T00:00:00.000Z' },
      { coinId: 'ripple', addedAt: '2026-01-02T00:00:00.000Z' },
    ];
    saveWatchlist(items);
    expect(loadWatchlist()).toEqual(items);
  });

  it('returns undefined when nothing saved', () => {
    expect(loadWatchlist()).toBeUndefined();
  });

  it('returns undefined for corrupt JSON', () => {
    window.localStorage.setItem('mp-watchlist-v1', '{not json');
    expect(loadWatchlist()).toBeUndefined();
  });

  it('filters out invalid entries', () => {
    window.localStorage.setItem(
      'mp-watchlist-v1',
      JSON.stringify([
        { coinId: 'bitcoin', addedAt: '2026-01-01T00:00:00.000Z' },
        { coinId: 42, addedAt: '2026-01-01T00:00:00.000Z' },
        { coinId: 'ethereum' },
        null,
      ]),
    );
    expect(loadWatchlist()).toEqual([{ coinId: 'bitcoin', addedAt: '2026-01-01T00:00:00.000Z' }]);
  });

  it('clears the saved list', () => {
    saveWatchlist([{ coinId: 'bitcoin', addedAt: '2026-01-01T00:00:00.000Z' }]);
    clearWatchlist();
    expect(loadWatchlist()).toBeUndefined();
  });
});
