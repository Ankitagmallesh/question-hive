
import { db } from './apps/web/app/lib/db';
import { users, questionPaperStatuses } from '@repo/db';

async function main() {
  const allUsers = await db.select().from(users);
  console.log('--- USERS ---');
  console.log(JSON.stringify(allUsers, null, 2));

  const allStatuses = await db.select().from(questionPaperStatuses);
  console.log('--- STATUSES ---');
  console.log(JSON.stringify(allStatuses, null, 2));
}

main().catch(console.error);

