import 'dotenv/config';
import { db } from '@/db';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const drizzleMigrate = async () =>
  migrate(db, {
    migrationsFolder: './migrations',
  });

drizzleMigrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
