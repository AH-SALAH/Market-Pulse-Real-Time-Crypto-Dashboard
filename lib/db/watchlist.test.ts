import { describe, expect, it } from 'vitest';
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from './watchlist';

// These tests exercise the in-memory fallback path: DB_CONNECTION_STRING is
// unset in the test environment, so getDb() returns null and the memory store
// is used. The Mongo path is identical logic backed by the driver.
describe('watchlist persistence (memory fallback)', () => {
  it('adds a coin and returns it in the watchlist', async () => {
    const sessionId = `sess-add-${crypto.randomUUID()}`;
    await addToWatchlist(sessionId, 'bitcoin');
    const items = await getWatchlist(sessionId);
    expect(items).toHaveLength(1);
    expect(items[0].coinId).toBe('bitcoin');
    expect(items[0].addedAt).toBeInstanceOf(Date);
  });

  it('add is idempotent — re-adding does not duplicate', async () => {
    const sessionId = `sess-idem-${crypto.randomUUID()}`;
    await addToWatchlist(sessionId, 'ethereum');
    await addToWatchlist(sessionId, 'ethereum');
    const items = await getWatchlist(sessionId);
    expect(items).toHaveLength(1);
  });

  it('returns newest additions first', async () => {
    const sessionId = `sess-order-${crypto.randomUUID()}`;
    await addToWatchlist(sessionId, 'solana', new Date('2024-01-01T00:00:00Z'));
    await addToWatchlist(sessionId, 'bitcoin', new Date('2024-01-02T00:00:00Z'));
    const items = await getWatchlist(sessionId);
    expect(items.map((i) => i.coinId)).toEqual(['bitcoin', 'solana']);
  });

  it('removes a coin from the watchlist', async () => {
    const sessionId = `sess-rem-${crypto.randomUUID()}`;
    await addToWatchlist(sessionId, 'bitcoin');
    await addToWatchlist(sessionId, 'ethereum');
    await removeFromWatchlist(sessionId, 'bitcoin');
    const items = await getWatchlist(sessionId);
    expect(items.map((i) => i.coinId)).toEqual(['ethereum']);
  });

  it('is isolated per session', async () => {
    const a = `sess-a-${crypto.randomUUID()}`;
    const b = `sess-b-${crypto.randomUUID()}`;
    await addToWatchlist(a, 'bitcoin');
    expect(await getWatchlist(b)).toEqual([]);
  });
});
