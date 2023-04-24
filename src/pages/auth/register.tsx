import Card from '@/components/container/Card';
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
          </form>
        </Card>

        {isError && (
          <div className='mt-2 rounded-md border border-red-500 bg-red-200 px-2 py-1'>
            <p className='text-sm text-red-800'>
              Oisann! Det skjedde noe feil under registrering av kontoen.
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default Register;
