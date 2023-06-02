import { z } from 'zod';

export const createInvitationSchema = z.object({
  tenantId: z.string().uuid(),
});
