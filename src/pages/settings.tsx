import PageLayout from '@/components/layout/PageLayout';
import { NextPage } from 'next';
import Head from 'next/head';

const Settings: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <p>Innstillinger</p>
      </PageLayout>
    </>
  );
};

export default Settings;
