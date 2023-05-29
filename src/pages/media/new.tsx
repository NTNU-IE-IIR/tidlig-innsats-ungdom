import PageLayout from '@/components/layout/PageLayout';
import MediaEditor from '@/components/media/MediaEditor';
import { NextPage } from 'next';
import Head from 'next/head';

const NewMediaPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='grid grid-cols-3 px-1'>
        <MediaEditor />
      </PageLayout>
    </>
  );
};

export default NewMediaPage;
