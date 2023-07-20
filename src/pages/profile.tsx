import PageLayout from '@/components/layout/PageLayout';
import EditUserForm from '@/components/user/EditUserForm';
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
      <PageLayout>
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
      </PageLayout>
    </>
  );
};

export default Profile;
