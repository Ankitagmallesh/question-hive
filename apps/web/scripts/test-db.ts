
import { db } from '../app/lib/db'; // Adjust path if needed
import { sql } from '@repo/db';

async function main() {
  console.log('Testing DB connection...');
  const start = Date.now();
  try {
    const res = await db.execute(sql`SELECT 1 as "connected"`);
    const duration = Date.now() - start;
    console.log('DB Connection successful!');
    console.log('Result:', res);
    console.log(`Duration: ${duration}ms`);
  } catch (error) {
    console.error('DB Connection Failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
