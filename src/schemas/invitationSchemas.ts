import { z } from 'zod';

const MAX_INTEGER_VALUE = 2147483647;

export const createInvitationSchema = z.object({
  tenantId: z.string().uuid(),
  comment: z.string().optional(),
  maxUses: z.number().min(1).max(MAX_INTEGER_VALUE).optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
