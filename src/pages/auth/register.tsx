import Card from '@/components/container/Card';
import Alert from '@/components/feedback/Alert';
import Button from '@/components/input/Button';
import {
  RegisterUserAccountInput,
  registerUserAccountSchema,
} from '@/schemas/userAccountSchemas';
import { api } from '@/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import { NextPage } from 'next';
import Head from 'next/head';

const Register: NextPage = () => {
  const { data: registrationEnabled } =
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
    },
  });

  const onFormSubmit = (values: RegisterUserAccountInput) => {
    registerAccount(values);
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
            className='flex flex-col gap-1 py-2'
          >
            <label htmlFor='fu'>Fullt navn</label>
            <input {...form.getInputProps('fullName')} />

            <label htmlFor=''>E-post</label>
            <input {...form.getInputProps('email')} />

            <label htmlFor=''>Passord</label>
            <input type='password' {...form.getInputProps('password')} />

            <label htmlFor=''>Bekreft passord</label>
            <input
              type='password'
              {...form.getInputProps('passwordConfirmation')}
            />

            <Button
              isLoading={isLoading}
              className='mt-2 w-full self-center py-1.5'
            >
              <p className='text-sm font-medium'>Registrer konto</p>
            </Button>

            {!registrationEnabled && (
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
