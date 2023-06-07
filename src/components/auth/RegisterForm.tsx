import {
  RegisterUserAccountInput,
  registerUserAccountSchema,
} from '@/schemas/userAccountSchemas';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';
import Card from '../container/Card';
import Alert from '../feedback/Alert';
import ErrorLabel from '../feedback/ErrorLabel';
import Button from '../input/Button';
import TextField from '../input/TextField';

export interface RegisterFormProps {
  inviteCode?: string;
  children?: React.ReactNode;
}

const TRANSLATE_PREFIX = 'USER_REGISTRATION';

const RegisterForm: React.FC<RegisterFormProps> = ({
  inviteCode,
  children,
}) => {
  const {
    mutateAsync: registerAccount,
    isLoading,
    isError,
  } = api.userAccount.register.useMutation();

  const form = useForm<RegisterUserAccountInput>({
    validate: zodResolver(registerUserAccountSchema),
    initialValues: {
      email: '',
      fullName: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const router = useRouter();

  const onFormSubmit = async (values: RegisterUserAccountInput) => {
    try {
      const account = await registerAccount({
        ...values,
        inviteCode,
      });

      const routerTarget =
        account.role === 'GLOBAL_ADMIN' ? '/setup/wizard' : '/';

      const result = await signIn('credentials', {
        email: form.values.email,
        password: form.values.password,
        callbackUrl: routerTarget,
        redirect: false,
      });

      if (result?.ok) router.push(routerTarget);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Card>
        <form
          onSubmit={form.onSubmit((values) => onFormSubmit(values))}
          className='flex flex-col py-2'
        >
          <TextField label='Fullt navn' {...form.getInputProps('fullName')} />
          <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
            {form.errors.fullName}
          </ErrorLabel>

          <TextField
            className='mt-3'
            label='E-post'
            {...form.getInputProps('email', { withError: true })}
          />
          <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
            {form.errors.email}
          </ErrorLabel>

          <TextField
            className='mt-3'
            type='password'
            label='Passord'
            {...form.getInputProps('password', { withError: true })}
          />
          <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
            {form.errors.password}
          </ErrorLabel>

          <TextField
            className='mt-3'
            type='password'
            label='Bekreft passord'
            {...form.getInputProps('passwordConfirmation', {
              withError: true,
            })}
          />
          <ErrorLabel translatePrefix={TRANSLATE_PREFIX} translate>
            {form.errors.passwordConfirmation}
          </ErrorLabel>

          <Button
            type='submit'
            isLoading={isLoading}
            className='mt-2 w-full self-center py-1.5'
          >
            <p className='text-sm font-medium'>Registrer konto</p>
          </Button>

          {children}
        </form>
      </Card>

      {isError && (
        <Alert intent='error' className='mt-2'>
          Oisann! Det skjedde noe feil under registrering av kontoen.
        </Alert>
      )}
    </>
  );
};

export default RegisterForm;
