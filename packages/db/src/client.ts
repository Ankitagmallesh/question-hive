// @ts-nocheck
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const getConnectionString = (): string => {
  // Prefer pooled connection string for Supabase PgBouncer
  const pooledUrl = process.env.SUPABASE_DB_POOLED_URL;
  const connectUrl = process.env.SUPABASE_DB_CONNECT_URL;
  const databaseUrl = process.env.DATABASE_URL;

  const connectionString = pooledUrl || connectUrl || databaseUrl || '';

  if (!connectionString) {
    throw new Error(
      'Missing database connection string. ' +
      'Please set one of: SUPABASE_DB_POOLED_URL (preferred), SUPABASE_DB_CONNECT_URL, or DATABASE_URL'
    );
  }

  // Normalize the URL - remove pgbouncer flags if present (pooled URL should already have them)
  if (pooledUrl) {
    // Keep pooled URL as-is
    return connectionString;
  } else {
    // For non-pooled URLs, remove pgbouncer flags and ensure pooling is configured in client
    return connectionString
      .replace('?pgbouncer=true', '')
      .replace('&pgbouncer=true', '');
  }
};

/**
 * Global connection singleton for handling hot reloading in development
 * Ensures per-request connections are eliminated in favor of a single persistent pool
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  dbInstance: ReturnType<typeof drizzle> | undefined;
};

/**
 * Create a singleton database connection with optimal pool settings
 * Uses PgBouncer pooling mode for Supabase to minimize concurrent connections
 */
const initializeConnection = (): postgres.Sql => {
  if (globalForDb.conn) {
    return globalForDb.conn;
  }

  const connectionString = getConnectionString();
  const isPooled = connectionString.includes('pgbouncer=true') || process.env.SUPABASE_DB_POOLED_URL;

  const conn = postgres(connectionString, {
    // PgBouncer pooling mode configuration
    prepare: false, // Required for transaction pooler (PgBouncer)
    ssl: 'require',

    // Pool size: Conservative for serverless/edge deployment
    // Each connection is kept alive and reused
    max: isPooled ? 5 : 10, // Smaller for pooled, slightly larger for direct
    idle_timeout: 20, // Close idle connections after 20 seconds
    idle_in_transaction_session_timeout: 60, // Force close long-lived transactions
    connect_timeout: 10, // Fail fast on connection errors
    keepalives: true,
    keepalives_idle: 30,

    // Query timeout to prevent runaway queries
    query_timeout: 30000, // 30 seconds
    statement_timeout: 30000,

    // Connection retry configuration
    max_lifetime: 60 * 60, // Recycle connections after 1 hour
    max_attempts: 3, // Retry failed connections
  });

  // Store in global for hot reload support in development
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.conn = conn;
  }

  return conn;
};

const conn = initializeConnection();

/**
 * Singleton drizzle instance - reuse the same connection pool
 * This eliminates per-request database connection overhead
 */
const initializeDrizzle = (): ReturnType<typeof drizzle> => {
  if (globalForDb.dbInstance) {
    return globalForDb.dbInstance;
  }

  const dbInstance = drizzle(conn, { schema });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.dbInstance = dbInstance;
  }

  return dbInstance;
};

export const db = initializeDrizzle();

// Proxy enables keeping `db.<method>` usage while lazy-initializing
export const db = new Proxy({}, {
  get(_t, prop) {
    const inst = ensureDb() as unknown;
    return (inst as Record<PropertyKey, unknown>)[prop];
  },
  apply(_t: unknown, _this: unknown, args: unknown[]): unknown {
    const inst = ensureDb() as unknown;
    return typeof inst === 'function' ? (inst as (...args: unknown[]) => unknown)(...args) : inst;
  }
}) as unknown;
// Graceful connection closing (for serverless cleanup)
const gracefulShutdown = async () => {
  if (conn) {
    try {
      await conn.end();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
};

if (typeof global !== 'undefined') {
  (global as any).gracefulDbShutdown = gracefulShutdown;
}

export * from './schema';
export { eq, and, or, asc, desc, sql, inArray, isNotNull, gt } from 'drizzle-orm';
