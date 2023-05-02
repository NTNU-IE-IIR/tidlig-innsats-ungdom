import Card from '@/components/container/Card';
import TextEditor from '@/components/editor/TextEditor';
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

        <div className='grid h-96 grid-cols-3 gap-4'>
          <Card className='col-span-2'>
            <h2 className='text-lg font-bold'>Nytt innhold</h2>
            
            <TextEditor name='media' />
          </Card>
          <Card>
            <h2>Knytt til en/flere temaer</h2>
          </Card>
        </div>
      </PageLayout>
    </>
  );
};

export default ManagePage;
