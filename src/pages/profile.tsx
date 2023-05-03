import PageLayout from '@/components/layout/PageLayout';
import { NextPage } from 'next';
import Head from 'next/head';

const Profile: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <p>Profil</p>
      </PageLayout>
    </>
  );
};

export default Profile;
