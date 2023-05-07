import Card from '@/components/container/Card';
import Button from '@/components/input/Button';
import TextField from '@/components/input/TextField';
import { api } from '@/utils/api';
import {
  ChevronRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getCsrfToken } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

const Login = ({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const { data: isUninitialized } = api.appSettings.uninitialized.useQuery(
    undefined,
    {
      // prevents the query from running after the initial load
      enabled: !hasLoaded,
      onSuccess: () => setHasLoaded(true),
    }
  );

  return (
    <>
      <Head>
        <title>Logg inn - Tidlig innsats ungdom</title>
      </Head>
      <main className='m-auto flex h-screen max-w-sm flex-col justify-center'>
        <h1 className='text-center text-xl font-bold'>Tidlig innsats ungdom</h1>
        <span className='text-center font-medium'>
          Logg inn for å få tilgang
        </span>

        <Card>
          <form
            className='flex flex-col gap-1 py-2'
            method='post'
            action='/api/auth/callback/credentials'
          >
            <input type='hidden' name='csrfToken' defaultValue={csrfToken} />

            <TextField name='email' label='E-post' />

            <TextField
              name='password'
              type='password'
              label='Passord'
              className='mt-2'
            />

            <Link
              href='/auth/forgot-password'
              className='self-end text-xs font-semibold text-emerald-700'
            >
              Glemt passord?
            </Link>

            <Button className='mt-2 w-full self-center py-1.5'>
              <p className='text-sm font-medium'>Logg inn</p>
            </Button>
          </form>
        </Card>

        {isUninitialized && (
          <Link
            href='/auth/register'
            className='mt-2 flex max-w-md items-center gap-2 rounded-md border border-sky-600 bg-sky-200/30 p-1 text-sky-900'
          >
            <InformationCircleIcon className='h-6 w-6' />

            <p className='flex-1 text-sm'>
              Fant ingen registrerte kontoer, klikk her for å registrere en
              administrator.
            </p>

            <ChevronRightIcon className='h-6 w-6' />
          </Link>
        )}
      </main>
    </>
  );
};

export default Login;
