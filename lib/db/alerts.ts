// Price-alert persistence — MongoDB (running) with Couchbase N1QL equivalents
// (target-JD concepts, PLAN.md §4.5). Same session-scoped pattern as the
// watchlist (lib/db/watchlist.ts): no auth, keyed by an anonymous session id
// from lib/session.ts.
//
// Collection: market-pulse.price_alerts
// Document shape: { id, sessionId, coinId, coinName, targetPrice, note, createdAt }

import { type Db } from 'mongodb';
import { getDb } from './client';

export interface AlertRecord {
  id: string;
  sessionId: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  note?: string;
  createdAt: Date;
}

export interface AlertItem {
  id: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  note?: string;
  createdAt: Date;
}

export interface CreateAlertInput {
  sessionId: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  note?: string;
  /** Defaults to now; overridable for deterministic ordering in tests. */
  createdAt?: Date;
}

const COLLECTION = 'price_alerts';

// In-memory fallback: Map<sessionId, Map<id, AlertRecord>>. Only used when no
// MongoDB connection is available (see lib/db/client.ts design note).
const memoryStore = new Map<string, Map<string, AlertRecord>>();

function memoryGet(sessionId: string): AlertItem[] {
  const items = memoryStore.get(sessionId) ?? new Map<string, AlertRecord>();
  return [...items.values()]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(toItem);
}

function memoryCreate(
  sessionId: string,
  input: Omit<CreateAlertInput, 'sessionId'>,
): AlertItem {
  const record: AlertRecord = {
    id: crypto.randomUUID(),
    sessionId,
    coinId: input.coinId,
    coinName: input.coinName,
    targetPrice: input.targetPrice,
    note: input.note,
    createdAt: input.createdAt ?? new Date(),
  };
  let items = memoryStore.get(sessionId);
  if (!items) {
    items = new Map<string, AlertRecord>();
    memoryStore.set(sessionId, items);
  }
  items.set(record.id, record);
  return toItem(record);
}

function memoryDelete(sessionId: string, id: string): void {
  memoryStore.get(sessionId)?.delete(id);
}

function toItem(record: AlertRecord): AlertItem {
  return {
    id: record.id,
    coinId: record.coinId,
    coinName: record.coinName,
    targetPrice: record.targetPrice,
    note: record.note,
    createdAt: record.createdAt,
  };
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
    console.error('Alert Mongo op failed — using in-memory fallback:', error);
    return memoryFn();
  }
}

export async function getAlerts(sessionId: string): Promise<AlertItem[]> {
  return withStore(
    async (db) => {
      // N1QL equivalent:
      // SELECT id, coinId, coinName, targetPrice, note, createdAt
      // FROM `market-pulse`.`price_alerts`
      // WHERE sessionId = $sessionId
      // ORDER BY createdAt DESC;
      const rows = await db
        .collection<AlertRecord>(COLLECTION)
        .find({ sessionId })
        .sort({ createdAt: -1 })
        .toArray();
      return rows.map(toItem);
    },
    () => memoryGet(sessionId),
  );
}

export async function createAlert(
  sessionId: string,
  input: Omit<CreateAlertInput, 'sessionId'>,
): Promise<AlertItem> {
  return withStore(
    async (db) => {
      // N1QL equivalent:
      // INSERT INTO `market-pulse`.`price_alerts` (KEY $id)
      // VALUES { sessionId: $sessionId, coinId: $coinId, coinName: $coinName,
      //          targetPrice: $targetPrice, note: $note, createdAt: $createdAt };
      const record: AlertRecord = {
        id: crypto.randomUUID(),
        sessionId,
        coinId: input.coinId,
        coinName: input.coinName,
        targetPrice: input.targetPrice,
        note: input.note,
        createdAt: input.createdAt ?? new Date(),
      };
      await db.collection<AlertRecord>(COLLECTION).insertOne(record);
      return toItem(record);
    },
    () => memoryCreate(sessionId, input),
  );
}

export async function deleteAlert(sessionId: string, id: string): Promise<void> {
  return withStore(
    async (db) => {
      // N1QL equivalent:
      // DELETE FROM `market-pulse`.`price_alerts`
      // WHERE sessionId = $sessionId AND id = $id;
      await db.collection<AlertRecord>(COLLECTION).deleteOne({ sessionId, id });
    },
    () => memoryDelete(sessionId, id),
  );
}

// Recommended index (Atlas, once created via `createIndex` at provisioning):
//   db.price_alerts.createIndex({ sessionId: 1, createdAt: -1 });
// N1QL equivalent (CREATE INDEX):
//   CREATE INDEX idx_alerts_session ON `market-pulse`.`price_alerts`
//   (sessionId, createdAt DESC);
