// @ts-nocheck
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = (process.env.SUPABASE_DB_CONNECT_URL || process.env.DATABASE_URL || '')
  .replace('?pgbouncer=true', '')
  .replace('&pgbouncer=true', '');

if (!connectionString) {
  throw new Error('Missing SUPABASE_DB_CONNECT_URL or DATABASE_URL');
}

// Singleton pattern for handling hot reloading in development
const globalForDb = globalThis as unknown as { conn: postgres.Sql | undefined };

const conn = globalForDb.conn ?? postgres(connectionString, {
  prepare: false, // Required for Supabase Transaction Pooler (PgBouncer)
  ssl: 'require',
  max: 10, // Keep connection pool size small for serverless
  connect_timeout: 10, // Fail fast (10s) instead of hanging
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

export * from './schema';
export { eq, and, or, asc, desc, sql, inArray, isNotNull, gt } from 'drizzle-orm';
