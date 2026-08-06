import { describe, expect, it } from 'vitest';
import { createAlert, deleteAlert, getAlerts } from './alerts';

// These tests exercise the in-memory fallback path: DB_CONNECTION_STRING is
// unset in the test environment, so getDb() returns null and the memory store
// is used. The Mongo path is identical logic backed by the driver.
describe('alert persistence (memory fallback)', () => {
  it('creates an alert and returns it', async () => {
    const sessionId = `sess-add-${crypto.randomUUID()}`;
    const alert = await createAlert(sessionId, {
      coinId: 'bitcoin',
      coinName: 'Bitcoin',
      targetPrice: 70000,
    });
    expect(alert.coinId).toBe('bitcoin');
    expect(alert.targetPrice).toBe(70000);
    expect(alert.createdAt).toBeInstanceOf(Date);

    const items = await getAlerts(sessionId);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(alert.id);
  });

  it('stores an optional note', async () => {
    const sessionId = `sess-note-${crypto.randomUUID()}`;
    await createAlert(sessionId, {
      coinId: 'ethereum',
      coinName: 'Ethereum',
      targetPrice: 3000,
      note: 'buy the dip',
    });
    const items = await getAlerts(sessionId);
    expect(items[0].note).toBe('buy the dip');
  });

  it('returns newest alerts first', async () => {
    const sessionId = `sess-order-${crypto.randomUUID()}`;
    await createAlert(sessionId, {
      coinId: 'solana',
      coinName: 'Solana',
      targetPrice: 100,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    });
    await createAlert(sessionId, {
      coinId: 'bitcoin',
      coinName: 'Bitcoin',
      targetPrice: 70000,
      createdAt: new Date('2024-01-02T00:00:00Z'),
    });
    const items = await getAlerts(sessionId);
    expect(items.map((i) => i.coinId)).toEqual(['bitcoin', 'solana']);
  });

  it('deletes an alert by id', async () => {
    const sessionId = `sess-del-${crypto.randomUUID()}`;
    const keep = await createAlert(sessionId, { coinId: 'bitcoin', coinName: 'Bitcoin', targetPrice: 70000 });
    const remove = await createAlert(sessionId, { coinId: 'ethereum', coinName: 'Ethereum', targetPrice: 3000 });
    await deleteAlert(sessionId, remove.id);
    const items = await getAlerts(sessionId);
    expect(items.map((i) => i.id)).toEqual([keep.id]);
  });

  it('is isolated per session', async () => {
    const a = `sess-a-${crypto.randomUUID()}`;
    const b = `sess-b-${crypto.randomUUID()}`;
    await createAlert(a, { coinId: 'bitcoin', coinName: 'Bitcoin', targetPrice: 70000 });
    expect(await getAlerts(b)).toEqual([]);
  });
});
