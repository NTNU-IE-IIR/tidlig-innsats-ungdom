import { createTRPCRouter } from '@/server/api/trpc';
import { appSettingsRouter } from './routers/appSettingsRouter';
import { contentRouter } from './routers/contentRouter';
import { invitationRouter } from './routers/invitationRouter';
import { mediaRouter } from './routers/mediaRouter';
import { tenantRouter } from './routers/tenantRouter';
import { themeRouter } from './routers/themeRouter';
import { userAccountRouter } from './routers/userAccountRouter';

export const appRouter = createTRPCRouter({
  appSettings: appSettingsRouter,
  content: contentRouter,
  userAccount: userAccountRouter,
  theme: themeRouter,
  media: mediaRouter,
  invitation: invitationRouter,
  tenant: tenantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
