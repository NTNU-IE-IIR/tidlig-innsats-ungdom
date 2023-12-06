import RegisterForm from '@/components/auth/RegisterForm';
import Card from '@/components/container/Card';
import Alert from '@/components/feedback/Alert';
import { api } from '@/utils/api';
import { IconAlertTriangleFilled, IconLoader2 } from '@tabler/icons-react';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const JoinPage: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { code } = router.query;
  const parsedCode =
    code !== undefined && typeof code !== 'string' ? code[0] : code;
  const enabled = code !== undefined;

  const {
    data: invite,
    isError,
    isFetching,
  } = api.invitation.getInvite.useQuery(parsedCode!, {
    enabled,
    retry: false,
  });

  return (
    <>
      <Head>
        <title>Bli med - Tidlig innsats ungdom</title>
      </Head>

      <main className='m-auto flex h-screen max-w-sm flex-col items-center justify-center'>
        {!enabled && !isFetching && (
          <ErrorCard
            title='Kode mangler'
            description='Du må ha en invitasjonskode for å bli med.'
          />
        )}

        {isError && (
          <ErrorCard
            title='Ugyldig invitasjon'
            description='Invitasjonen er enten utgått, oppbrukt eller eksisterer ikke.'
          />
        )}

        {!invite && isFetching && (
          <IconLoader2 className='h-12 w-12 animate-spin' />
        )}

        {invite && (
          <div>
            <h1 className='text-center text-lg font-medium'>
              <strong className='font-semibold'>{invite.inviteeName}</strong>{' '}
              inviterer deg til å bli med i{' '}
              <strong className='font-semibold'>{invite.tenantName}</strong>
            </h1>

            <p className='mb-2 text-center text-sm font-medium text-gray-700'>
              For å fortsette må du registrere en konto.
            </p>

            <RegisterForm inviteCode={parsedCode} />
          </div>
        )}

        {session !== null ? (
          <Link href='/'>
            <Alert intent='info' className='mt-2'>
              Du er allerede registrert med en konto, klikk{' '}
              <span className='underline'>her</span> for å gå til portalen.
            </Alert>
          </Link>
        ) : (
          <Link
            href='/'
            className='mt-2 flex flex-col items-center text-sm text-zinc-700 transition-colors'
          >
            <span>Allerede registrert?</span>
            <span className='font-medium underline text-primary-600'>
              Klikk her for å logge inn
            </span>
          </Link>
        )}
      </main>
    </>
  );
};

interface ErrorCardProps {
  title: string;
  description: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ title, description }) => (
  <Card className='flex flex-col items-center p-2'>
    <IconAlertTriangleFilled className='h-12 w-12 text-warn-500' />
    <h1 className='text-lg font-bold'>{title}</h1>
    <p className='text-center text-sm text-gray-600'>{description}</p>
  </Card>
);

export default JoinPage;
