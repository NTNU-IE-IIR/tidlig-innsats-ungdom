import Card from '@/components/container/Card';
import Alert from '@/components/feedback/Alert';
import ErrorLabel from '@/components/feedback/ErrorLabel';
import Button from '@/components/input/Button';
import TextField from '@/components/input/TextField';
import {
  RegisterUserAccountInput,
  registerUserAccountSchema,
} from '@/schemas/userAccountSchemas';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import { NextPage } from 'next';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Register: NextPage = () => {
  const { data: registrationEnabled, isLoading: loadingRegistrationEnabled } =
    api.appSettings.registrationEnabled.useQuery();
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
      const account = await registerAccount(values);

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
      <Head>
        <title>Registrer konto - Tidlig innsats ungdom</title>
      </Head>

      <main className='m-auto flex h-screen max-w-sm flex-col justify-center'>
        <h1 className='text-center text-xl font-bold'>Tidlig innsats ungdom</h1>
        <span className='text-center font-medium'>Registrer konto</span>
        <Card>
          <form
            onSubmit={form.onSubmit((values) => onFormSubmit(values))}
            className='flex flex-col py-2'
          >
            <TextField label='Fullt navn' {...form.getInputProps('fullName')} />
            <ErrorLabel>{form.errors.fullName}</ErrorLabel>

            <TextField
              className='mt-3'
              label='E-post'
              {...form.getInputProps('email', { withError: true })}
            />
            <ErrorLabel>{form.errors.email}</ErrorLabel>

            <TextField
              className='mt-3'
              type='password'
              label='Passord'
              {...form.getInputProps('password', { withError: true })}
            />
            <ErrorLabel>{form.errors.password}</ErrorLabel>

            <TextField
              className='mt-3'
              type='password'
              label='Bekreft passord'
              {...form.getInputProps('passwordConfirmation', {
                withError: true,
              })}
            />
            <ErrorLabel>{form.errors.passwordConfirmation}</ErrorLabel>

            <Button
              type='submit'
              isLoading={isLoading}
              className='mt-2 w-full self-center py-1.5'
            >
              <p className='text-sm font-medium'>Registrer konto</p>
            </Button>

            {!loadingRegistrationEnabled && !registrationEnabled && (
              <Alert intent='warning' className='mt-1'>
                Registrering av nye brukerkontoer er for øyeblikket slått av.
                Kontakt en administrator for å få opprettet en konto.
              </Alert>
            )}
          </form>
        </Card>

        {isError && (
          <Alert intent='error' className='mt-2'>
            Oisann! Det skjedde noe feil under registrering av kontoen.
          </Alert>
        )}
      </main>
    </>
  );
};

export default Register;
