import { createTRPCRouter } from '@/server/api/trpc';
import { themeRouter } from './routers/themeRouter';
import { appSettingsRouter } from './routers/appSettingsRouter';
import { userAccountRouter } from './routers/userAccountRouter';
import { mediaRouter } from './routers/mediaRouter';

export const appRouter = createTRPCRouter({
  appSettings: appSettingsRouter,
  userAccount: userAccountRouter,
  theme: themeRouter,
  media: mediaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
