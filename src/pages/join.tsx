import RegisterForm from '@/components/auth/RegisterForm';
import Card from '@/components/container/Card';
import { api } from '@/utils/api';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const JoinPage: NextPage = () => {
  const router = useRouter();
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
  });

  return (
    <>
      <main className='m-auto flex h-screen max-w-sm flex-col justify-center'>
        <div>
          {!enabled && <p>kode mangler</p>}

          {isError && <p>uforventet feil</p>}

          {isFetching && <p>laster...</p>}

          {invite && (
            <>
              <h1 className='text-lg font-medium text-center'>
                <strong className='font-semibold'>{invite.inviteeName}</strong>{' '}
                inviterer deg til å bli med i{' '}
                <strong className='font-semibold'>{invite.tenantName}</strong>
              </h1>

              <p className='text-sm font-medium text-center'>For å fortsette må du registrere en konto.</p>


              <Card>
                <RegisterForm inviteCode={parsedCode} />
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default JoinPage;
