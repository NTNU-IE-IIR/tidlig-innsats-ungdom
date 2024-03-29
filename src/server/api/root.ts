import { createTRPCRouter } from '@/server/api/trpc';
import { appSettingsRouter } from './routers/appSettingsRouter';
import { consultationRouter } from './routers/consultationRouter';
import { contentRouter } from './routers/contentRouter';
import { helpRouter } from './routers/helpRouter';
import { invitationRouter } from './routers/invitationRouter';
import { mediaRouter } from './routers/mediaRouter';
import { tenantRouter } from './routers/tenantRouter';
import { themeRouter } from './routers/themeRouter';
import { userAccountRouter } from './routers/userAccountRouter';

export const appRouter = createTRPCRouter({
  appSettings: appSettingsRouter,
  consultation: consultationRouter,
  content: contentRouter,
  help: helpRouter,
  userAccount: userAccountRouter,
  theme: themeRouter,
  media: mediaRouter,
  invitation: invitationRouter,
  tenant: tenantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
