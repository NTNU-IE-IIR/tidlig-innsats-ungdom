import { z } from 'zod';

export const registerUserAccountSchema = z
  .object({
    fullName: z.string().nonempty('FULL_NAME_REQUIRED'),
    email: z.string().email('INVALID_EMAIL_ADDRESS'),
    password: z.string().min(10, 'PASSWORD_NEEDS_10_CHARACTERS'),
    passwordConfirmation: z.string().nonempty('PASSWORD_CONFIRMATION_REQUIRED'),
  })
  .refine(
    (data) => {
      return data.password === data.passwordConfirmation;
    },
    {
      message: 'PASSWORDS_DO_NOT_MATCH',
      path: ['passwordConfirmation'],
    }
  );

export type RegisterUserAccountInput = z.infer<
  typeof registerUserAccountSchema
>;
