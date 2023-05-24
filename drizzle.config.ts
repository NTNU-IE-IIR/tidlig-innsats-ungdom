import type { Config } from 'drizzle-kit';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const drizzleEnvironmentSchema = z.object({
  host: z.string().nonempty(),
  port: z.string().nonempty().regex(/^\d+/g),
  user: z.string().nonempty(),
  password: z.string().nonempty(),
  database: z.string().nonempty(),
});

const drizzleEnvironment = drizzleEnvironmentSchema.parse({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export default {
  out: './migrations',
  schema: './src/server/db/schema/index.ts',
  ...drizzleEnvironment,
} satisfies Config;
