import { createTRPCRouter } from '@/server/api/trpc';
import { themeRouter } from './routers/themeRouter';
import { appSettingsRouter } from './routers/appSettingsRouter';
import { userAccountRouter } from './routers/userAccountRouter';

export const appRouter = createTRPCRouter({
  appSettings: appSettingsRouter,
  userAccount: userAccountRouter,
  theme: themeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
