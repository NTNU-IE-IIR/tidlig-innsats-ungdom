import { z } from 'zod';

export const createThemeSchema = z.object({
  name: z.string().nonempty(),
  shortDescription: z.string(),
  parentId: z.number().nullable(),
});

export const updateThemeSchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
  shortDescription: z.string(),
  parentId: z.number().nullable(),
});
