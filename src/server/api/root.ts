import { createTRPCRouter } from '@/server/api/trpc';
import { appSettingsRouter } from './routers/appSettingsRouter';
import { contentRouter } from './routers/contentRouter';
import { mediaRouter } from './routers/mediaRouter';
import { themeRouter } from './routers/themeRouter';
import { userAccountRouter } from './routers/userAccountRouter';

export const appRouter = createTRPCRouter({
  appSettings: appSettingsRouter,
  content: contentRouter,
  userAccount: userAccountRouter,
  theme: themeRouter,
  media: mediaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
