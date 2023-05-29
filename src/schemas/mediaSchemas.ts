import { MediaType } from '@/server/db/schema';
import { z } from 'zod';

export const createMediaSchema = z.object({
  name: z.string().nonempty('NAME_CANNOT_BE_EMPTY'),
  shortDescription: z.string(),
  content: z.any(),
  themeIds: z.array(z.number().positive()),
  type: z.nativeEnum(MediaType),
  published: z.boolean(),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;

export const updateMediaSchema = createMediaSchema.extend({
  id: z.number().positive(),
});

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
