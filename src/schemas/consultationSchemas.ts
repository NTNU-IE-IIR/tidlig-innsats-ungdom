import { z } from 'zod';

export const endConsultationSchema = z.object({
  consultationId: z.string(),
  consultationName: z.string(),
  viewedMedias: z.record(z.string().regex(/\d+/), z.number()),
});
