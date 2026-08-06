// MongoDB client (official Node driver) — lazy singleton.
//
// Design note: this mirrors the CoinGecko proxy's resilience pattern. The app
// must stay demoable even when no cluster is configured (e.g. a reviewer has
// not yet added DB_CONNECTION_STRING to .env.local). So getDb() returns null
// and every query layer (lib/db/watchlist.ts) falls back to an in-memory store
// for the process lifetime. Add a real MongoDB Atlas connection string to
// .env.local and persistence becomes durable with zero code changes.
//
// Every Mongo query in lib/db/ carries a Couchbase N1QL equivalent in a code
// comment (PLAN.md §4.5) — the running code is Mongo, the concepts are N1QL.

import { MongoClient, type Db } from 'mongodb';

const URI = process.env.DB_CONNECTION_STRING;

let client: MongoClient | null = null;
let db: Db | null = null;
let dbPromise: Promise<Db | null> | null = null;

export async function getDb(): Promise<Db | null> {
  if (!URI) return null;

  if (db) return db;

  if (!dbPromise) {
    dbPromise = (async () => {
      client = new MongoClient(URI, {
        serverSelectionTimeoutMS: 3000,
      });
      await client.connect();
      db = client.db('market-pulse');
      return db;
    })().catch((error: unknown) => {
      // Cluster unreachable/misconfigured — fall back to in-memory store so the
      // demo never hard-fails. Recorded once; callers keep working on memory.
      console.error('MongoDB connection failed — using in-memory fallback:', error);
      client = null;
      db = null;
      return null;
    });
  }

  return dbPromise;
}
