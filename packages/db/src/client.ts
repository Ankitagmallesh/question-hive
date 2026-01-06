// @ts-nocheck
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

class MissingDatabaseEnvError extends Error {
  constructor() {
    super('[db] Missing SUPABASE_DB_CONNECT_URL or DATABASE_URL environment variable');
    this.name = 'MissingDatabaseEnvError';
  }
}

const isBrowser = typeof window !== 'undefined';
const isEdge = typeof process !== 'undefined' && !!process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME === 'edge';
let dbInstance: ReturnType<typeof drizzle> | undefined;

function createDb() {
  const connectionString = process.env.SUPABASE_DB_CONNECT_URL || process.env.DATABASE_URL || '';
  if (!connectionString) throw new MissingDatabaseEnvError();
  const client = postgres(connectionString, { ssl: 'require', prepare: false });
  return drizzle(client, { schema });
}

function ensureDb() {
  if (dbInstance) return dbInstance;
  if (isBrowser) {
    console.warn('[db] Attempted to init DB in browser; ensure you only call server code.');
    // Still attempt – but most likely will fail due to missing env / disabled network
  }
  try {
    dbInstance = createDb();
  } catch (err) {
    // Re-throw with clearer context when first real method/property is accessed
    throw err;
  }
  return dbInstance;
}

// Proxy enables keeping `db.<method>` usage while lazy-initializing
export const db = new Proxy({}, {
  get(_t, prop) {
    const inst = ensureDb() as any;
    return inst[prop];
  },
  apply(_t, _this, args) {
    const inst = ensureDb() as any;
    return typeof inst === 'function' ? inst(...args) : inst;
  }
}) as any;
export * from './schema';
// Re-export Drizzle helpers from this package to ensure a single instance is used by dependents
export { eq, and, or, asc, desc, sql, inArray } from 'drizzle-orm';
