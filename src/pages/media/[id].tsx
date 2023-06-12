import TextViewer from '@/components/editor/TextViewer';
import Button from '@/components/input/Button';
import PageLayout from '@/components/layout/PageLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { api } from '@/utils/api';
import { IconPrinter } from '@tabler/icons-react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MediaView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: media, isError } = api.media.getById.useQuery(Number(id), {
    enabled: !Number.isNaN(id),
  });

  const openPrinterPrompt = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <div className='flex justify-end print:hidden'>
          <Button
            variant='neutral'
            className='self-end bg-white text-sm pl-1.5'
            onClick={openPrinterPrompt}
          >
            <IconPrinter className='h-5 w-5' />
            <span className='font-semibold'>Skriv ut</span>
          </Button>
        </div>

        {isError && <p></p>}

        <Breadcrumbs />

        {media && <TextViewer name='media' content={media.content as any} />}
      </PageLayout>
    </>
  );
};

export default MediaView;
