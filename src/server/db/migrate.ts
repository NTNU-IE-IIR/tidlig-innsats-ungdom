import 'dotenv/config';
import { db } from '@/server/db';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const drizzleMigrate = async () =>
  migrate(db, {
    migrationsFolder: './migrations',
  });

drizzleMigrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
