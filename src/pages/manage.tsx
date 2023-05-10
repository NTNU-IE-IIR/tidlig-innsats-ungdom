import Card from '@/components/container/Card';
import TextEditor from '@/components/editor/TextEditor';
import Alert from '@/components/feedback/Alert';
import PageLayout from '@/components/layout/PageLayout';
import ThemeListNode from '@/components/theme/ThemeListNode';
import { api } from '@/utils/api';
import { NextPage } from 'next';
import Head from 'next/head';

const ManagePage: NextPage = () => {
  const { data: themes } = api.theme.listThemeTree.useQuery({});

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

            <ul>
              {themes?.map((theme) => (
                <ThemeListNode key={theme.id} theme={theme} />
              ))}
            </ul>
          </Card>
        </div>
      </PageLayout>
    </>
  );
};

export default ManagePage;
