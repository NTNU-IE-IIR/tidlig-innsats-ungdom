import { z } from 'zod';

export const saveConsultationSchema = z.object({
  tenantId: z.string(),
  consultationName: z.string(),
  startedAt: z.string().datetime(),
  viewedMedias: z.record(z.string().regex(/\d+/), z.number()),
  notes: z.string(),
});
