import { MediaType } from '@/server/db/schema';
import { z } from 'zod';

export const createMediaSchema = z.object({
  name: z.string().nonempty('NAME_CANNOT_BE_EMPTY'),
  content: z.any(),
  themeIds: z.array(z.number().positive()),
  type: z.nativeEnum(MediaType),
});
