import { defineConfig } from 'drizzle-kit';
import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const envPrimary = path.join(cwd, '.env');
const envLocal = path.join(cwd, '.env.local');
dotenv.config({ path: envPrimary });
dotenv.config({ path: envLocal });
// Use project-relative paths so CLI doesn't prefix './' to an absolute path
const schemaPath = 'packages/db/src/schema.ts';
const outDir = 'packages/db/migrations';

export default defineConfig({
  dialect: 'postgresql',
  schema: schemaPath,
  out: outDir,
  dbCredentials: (() => {
    const url = process.env.SUPABASE_DB_CONNECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing SUPABASE_DB_CONNECT_URL or DATABASE_URL. Set SUPABASE_DB_CONNECT_URL in .env.local for Supabase-only mode.');
    return { url } as const;
  })(),
  strict: true,
  verbose: true,
});
