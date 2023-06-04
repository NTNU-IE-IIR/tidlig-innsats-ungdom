import RegisterForm from '@/components/auth/RegisterForm';
import Alert from '@/components/feedback/Alert';
import { api } from '@/utils/api';
import { NextPage } from 'next';
import Head from 'next/head';

const Register: NextPage = () => {
  const { data: registrationEnabled, isLoading: loadingRegistrationEnabled } =
    api.appSettings.registrationEnabled.useQuery();

  return (
    <>
      <Head>
        <title>Registrer konto - Tidlig innsats ungdom</title>
      </Head>

      <main className='m-auto flex h-screen max-w-sm flex-col justify-center'>
        <h1 className='text-center text-xl font-bold'>Tidlig innsats ungdom</h1>
        <span className='text-center font-medium'>Registrer konto</span>

        <RegisterForm>
          {!loadingRegistrationEnabled && !registrationEnabled && (
            <Alert intent='warning' className='mt-1'>
              Registrering av nye brukerkontoer er for øyeblikket slått av.
              Kontakt en administrator for å få opprettet en konto.
            </Alert>
          )}
        </RegisterForm>
      </main>
    </>
  );
};

export default Register;
