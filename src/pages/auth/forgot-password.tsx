import Card from '@/components/container/Card';
import Button from '@/components/input/Button';
import TextField from '@/components/input/TextField';
import { NextPage } from 'next';
import Link from 'next/link';

const ForgotPassword: NextPage = () => {
  return (
    <main className='m-auto flex h-screen max-w-sm flex-col justify-center'>
      <h1 className='text-center text-xl font-bold'>Tidlig innsats ungdom</h1>
      <span className='text-center font-medium'>Glemt passord</span>
      <Card>
        <TextField className='my-2' label='E-post' />

        <Button className='mb-1 w-full py-1.5 text-sm'>
          Send gjenopprettingslenke
        </Button>

        <p className='mt-4 text-center text-sm text-gray-600'>
          Husket du passordet ditt likevel?
        </p>

        <Link
          href='/auth/login'
          className='block text-center text-sm font-semibold text-primary-500 hover:underline'
        >
          Logg inn
        </Link>
      </Card>
    </main>
  );
};

export default ForgotPassword;
