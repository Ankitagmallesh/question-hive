
import { db } from './apps/web/app/lib/db';
import { userRoles } from '@repo/db';

async function main() {
  const roles = await db.select().from(userRoles);
  console.log('--- ROLES ---');
  console.log(JSON.stringify(roles, null, 2));
}

main().catch(console.error);
