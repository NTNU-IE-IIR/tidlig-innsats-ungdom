import PageLayout from '@/components/layout/PageLayout';
import { NextPage } from 'next';
import Head from 'next/head';

const ManagePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <p>Tema administrasjon</p>
      </PageLayout>
    </>
  );
};

export default ManagePage;
