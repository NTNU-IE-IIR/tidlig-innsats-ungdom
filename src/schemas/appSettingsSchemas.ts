import { z } from 'zod';

export const configureSchema = z.object({
  registrationEnabled: z.boolean(),
  tenantName: z.string(),
  tenantId: z.string().uuid().optional(),
});

export type ConfigureInput = z.infer<typeof configureSchema>;
