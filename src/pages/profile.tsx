import Card from '@/components/container/Card';
import Button from '@/components/input/Button';
import PageLayout from '@/components/layout/PageLayout';
import EditUserForm from '@/components/user/EditUserForm';
import { IconFileUpload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head';

const Profile: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='flex gap-8 py-2'>
        <div className='flex flex-col items-center'>
          <h1 className='invisible text-lg font-bold'>Detaljer</h1>
          <div className='h-48 w-48 rounded-full bg-zinc-600' />

          <Button
            variant='neutral'
            className='my-2 bg-white text-sm font-medium'
          >
            <IconFileUpload className='h-5 w-5' />
            <span>Bytt profilbilde</span>
          </Button>

          <p className='text-sm'>
            <span className='font-semibold'>Opprettet:</span>{' '}
            {dayjs().format('HH:mm DD.MM.YYYY')}
          </p>
          <p className='text-sm'>
            <span className='font-semibold'>Sist endret:</span>{' '}
            {dayjs().format('HH:mm DD.MM.YYYY')}
          </p>
        </div>

        <div className='flex flex-1 flex-col'>
          <h1 className='text-lg font-bold'>Brukerinformasjon</h1>
          <Card className='py-2'>
            {session && (
              <EditUserForm
                id={session?.user.id}
                email={session?.user.email}
                fullName={session?.user.name!}
                // TODO: Find out where this^ type signature goes wrong - ideally it should be fullName to reflect the database but NextAuth may enforce another type
                isCurrentUser
                onSuccess={signOut}
              />
            )}
          </Card>
          <h1 className='mt-4 text-lg font-bold'>Innhold</h1>
          <Card className='py-4'>
            <p className='text-center text-sm font-medium text-zinc-600'>
              Her var det tomt.
            </p>
          </Card>
        </div>
      </PageLayout>
    </>
  );
};

export default Profile;
