import { relations } from 'drizzle-orm';
import { media, theme, themeMedia } from './content';
import {
  providerAccount,
  tenant,
  tenantUserAccount,
  userAccount,
  userAccountSession,
} from './core';

export const themeRelations = relations(theme, ({ one, many }) => ({
  parent: one(theme, {
    fields: [theme.parentId],
    references: [theme.id],
  }),
  creator: one(userAccount, {
    fields: [theme.createdBy],
    references: [userAccount.id],
  }),
  media: many(themeMedia),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  creator: one(userAccount, {
    fields: [media.createdBy],
    references: [userAccount.id],
  }),
  themes: many(themeMedia),
}));

export const themeToMediaRelations = relations(themeMedia, ({ one }) => ({
  theme: one(theme, {
    fields: [themeMedia.themeId],
    references: [theme.id],
  }),
  media: one(media, {
    fields: [themeMedia.mediaId],
    references: [media.id],
  }),
}));

export const userAccountRelations = relations(userAccount, ({ many }) => ({
  themes: many(theme),
  media: many(media),
  tenants: many(tenant),
  providers: many(providerAccount),
  sessions: many(userAccountSession),
}));

export const userAccountSessionRelations = relations(
  userAccountSession,
  ({ one }) => ({
    userAccount: one(userAccount, {
      fields: [userAccountSession.userAccountId],
      references: [userAccount.id],
    }),
  })
);

export const providerAccountRelations = relations(
  providerAccount,
  ({ one }) => ({
    userAccount: one(userAccount, {
      fields: [providerAccount.userAccountId],
      references: [userAccount.id],
    }),
  })
);

export const tenantRelations = relations(tenant, ({ many }) => ({
  users: many(userAccount),
}));

export const tenantToUserAccountRelations = relations(
  tenantUserAccount,
  ({ one }) => ({
    tenant: one(tenant, {
      fields: [tenantUserAccount.tenantId],
      references: [tenant.id],
    }),
    userAccount: one(userAccount, {
      fields: [tenantUserAccount.userAccountId],
      references: [userAccount.id],
    }),
  })
);
