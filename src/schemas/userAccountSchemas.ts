import { z } from 'zod';

export const registerUserAccountSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(12),
});

export type RegisterUserAccountInput = z.infer<
  typeof registerUserAccountSchema
>;
