import { z } from 'zod';

export const registerUserAccountSchema = z
  .object({
    fullName: z.string().nonempty('FULL_NAME_REQUIRED'),
    email: z.string().email('INVALID_EMAIL_ADDRESS'),
    password: z.string().min(10, 'PASSWORD_NEEDS_10_CHARACTERS'),
    passwordConfirmation: z.string().nonempty('PASSWORD_CONFIRMATION_REQUIRED'),
    inviteCode: z.string().optional(),
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

export const updateUserAccountSchema = z
  .object({
    id: z.string().uuid('INVALID_UUID'),
    fullName: z.string().nonempty('FULL_NAME_REQUIRED'),
    email: z.string().email('INVALID_EMAIL_ADDRESS'),
    currentPassword: z.string(),
    changePassword: z.boolean(),
    newPassword: z.string(),
    newPasswordConfirmation: z.string(),
  })
  .refine(
    (data) => {
      if (!data.changePassword) return true;

      return data.newPassword === data.newPasswordConfirmation;
    },
    {
      message: 'PASSWORDS_DO_NOT_MATCH',
      path: ['newPasswordConfirmation'],
    }
  )
  .refine(
    (data) => {
      if (!data.changePassword) return true;

      return data.newPassword.length >= 10;
    },
    {
      message: 'PASSWORD_NEEDS_10_CHARACTERS',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (!data.changePassword) return true;

      return data.newPasswordConfirmation.length > 0;
    },
    {
      message: 'PASSWORD_CONFIRMATION_REQUIRED',
      path: ['newPasswordConfirmation'],
    }
  );

export type UpdateUserAccountInput = z.infer<typeof updateUserAccountSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().nonempty('PASSWORD_CANNOT_BE_EMPTY'),
    newPassword: z.string().min(10, 'PASSWORD_NEEDS_10_CHARACTERS'),
    newPasswordConfirmation: z
      .string()
      .nonempty('PASSWORD_CONFIRMATION_REQUIRED'),
  })
  .refine(
    (data) => {
      return data.newPassword === data.newPasswordConfirmation;
    },
    {
      message: 'PASSWORDS_DO_NOT_MATCH',
      path: ['newPasswordConfirmation'],
    }
  );
