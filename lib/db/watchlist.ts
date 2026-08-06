// Watchlist persistence — MongoDB (running) with Couchbase N1QL equivalents
// (target-JD concepts, PLAN.md §4.5). No auth: the watchlist is keyed by an
// anonymous session id from lib/session.ts.
//
// Collection: market-pulse.watchlist_items
// Document shape: { sessionId, coinId, addedAt }

import { type Db } from 'mongodb';
import { getDb } from './client';

export interface WatchlistRecord {
  sessionId: string;
  coinId: string;
  addedAt: Date;
}

export interface WatchlistItem {
  coinId: string;
  addedAt: Date;
}

const COLLECTION = 'watchlist_items';

// In-memory fallback: Map<sessionId, Map<coinId, addedAt>>. Only used when no
// MongoDB connection is available (see lib/db/client.ts design note).
const memoryStore = new Map<string, Map<string, Date>>();

function memoryGet(sessionId: string): WatchlistItem[] {
  const items = memoryStore.get(sessionId) ?? new Map<string, Date>();
  return [...items.entries()]
    .map(([coinId, addedAt]) => ({ coinId, addedAt }))
    .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
}

function memoryAdd(sessionId: string, coinId: string, addedAt: Date): void {
  let items = memoryStore.get(sessionId);
  if (!items) {
    items = new Map<string, Date>();
    memoryStore.set(sessionId, items);
  }
  items.set(coinId, addedAt);
}

function memoryRemove(sessionId: string, coinId: string): void {
  memoryStore.get(sessionId)?.delete(coinId);
}

async function withStore<T>(
  mongoFn: (db: Db) => Promise<T>,
  memoryFn: () => T,
): Promise<T> {
  const db = await getDb();
  if (!db) return memoryFn();
  try {
    return await mongoFn(db);
  } catch (error) {
    console.error('Watchlist Mongo op failed — using in-memory fallback:', error);
    return memoryFn();
  }
}

export async function getWatchlist(sessionId: string): Promise<WatchlistItem[]> {
  return withStore(
    async (db) => {
      // N1QL equivalent:
      // SELECT coinId, addedAt FROM `market-pulse`.`watchlist_items`
      // WHERE sessionId = $sessionId
      // ORDER BY addedAt DESC;
      const rows = await db
        .collection<WatchlistRecord>(COLLECTION)
        .find({ sessionId })
        .sort({ addedAt: -1 })
        .toArray();
      return rows.map(({ coinId, addedAt }) => ({ coinId, addedAt }));
    },
    () => memoryGet(sessionId),
  );
}

export async function addToWatchlist(
  sessionId: string,
  coinId: string,
  addedAt: Date = new Date(),
): Promise<void> {
  return withStore(
    async (db) => {
      // N1QL equivalent:
      // UPSERT INTO `market-pulse`.`watchlist_items` (KEY $sessionId || ':' || $coinId)
      // VALUES { sessionId: $sessionId, coinId: $coinId, addedAt: $addedAt };
      // (upsert → idempotent, re-saves on repeat adds instead of erroring)
      await db.collection<WatchlistRecord>(COLLECTION).updateOne(
        { sessionId, coinId },
        { $set: { sessionId, coinId, addedAt } },
        { upsert: true },
      );
    },
    () => memoryAdd(sessionId, coinId, addedAt),
  );
}

export async function removeFromWatchlist(
  sessionId: string,
  coinId: string,
): Promise<void> {
  return withStore(
    async (db) => {
      // N1QL equivalent:
      // DELETE FROM `market-pulse`.`watchlist_items`
      // WHERE sessionId = $sessionId AND coinId = $coinId;
      await db.collection<WatchlistRecord>(COLLECTION).deleteOne({ sessionId, coinId });
    },
    () => memoryRemove(sessionId, coinId),
  );
}

// Recommended index (Atlas, once created via `createIndex` at provisioning):
//   db.watchlist_items.createIndex({ sessionId: 1, addedAt: -1 });
// N1QL equivalent (CREATE INDEX):
//   CREATE INDEX idx_watchlist_session ON `market-pulse`.`watchlist_items`
//   (sessionId, addedAt DESC);
