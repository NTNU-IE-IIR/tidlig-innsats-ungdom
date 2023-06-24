import { z } from 'zod';

export const endConsultationSchema = z.object({
  consultationId: z.string(),
  viewedMedias: z.record(z.number(), z.number()),
});
