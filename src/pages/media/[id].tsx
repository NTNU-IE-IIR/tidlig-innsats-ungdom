import TextViewer from '@/components/editor/TextViewer';
import Alert from '@/components/feedback/Alert';
import Button from '@/components/input/Button';
import PageLayout from '@/components/layout/PageLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { FileMedia, MediaType } from '@/server/db/schema';
import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import {
  IconChevronLeft,
  IconExternalLink,
  IconPrinter,
} from '@tabler/icons-react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const MediaView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { activeTenantId } = useTenantStore();
  const { incrementMediaViewDuration: incrementMedia, activeSession } =
    useSessionStore();

  const { data: media, isError } = api.media.getById.useQuery(Number(id), {
    enabled: !Number.isNaN(id),
    retry: 0,
  });

  const openPrinterPrompt = () => {
    window.print();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (media) {
        incrementMedia(media.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [media]);

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        {media && media.type !== MediaType.FILE && (
          <div className='flex justify-end print:hidden'>
            <Button
              variant='neutral'
              className='self-end bg-white pl-1.5 text-sm max-md:mr-2'
              onClick={openPrinterPrompt}
            >
              <IconPrinter className='h-5 w-5' />
              <span className='font-semibold'>Skriv ut</span>
            </Button>
          </div>
        )}

        <Breadcrumbs />

        {isError && (
          <div className='flex flex-col items-center justify-center gap-1'>
            <h1 className='text-6xl font-bold'>404</h1>
            <p className='font-medium'>Fant ikke innholdet du lette etter.</p>

            <Link
              href='/'
              className='flex items-center gap-1 rounded-md border border-gray-300 bg-white py-1 pl-1 pr-2 transition-colors hover:bg-gray-50'
            >
              <IconChevronLeft className='h-5 w-5' />
              <span className='text-sm font-medium'>
                Tilbake til temautforsker
              </span>
            </Link>
          </div>
        )}

        {media && media.type === MediaType.FILE && (
          <div className='mx-auto flex max-w-sm flex-col items-center justify-center gap-2 '>
            <a
              href={`/api/static/${activeTenantId}/${
                (media.content as FileMedia).fileId
              }`}
              target='_blank'
              className='flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 transition-colors hover:bg-gray-50'
            >
              <IconExternalLink className='h-5 w-5' />
              <span className='font-medium'>Åpne fil i ny fane</span>
            </a>

            {activeSession && (
              <Alert intent='info'>
                Forbli på denne siden om du ønsker å spore tiden du bruker på å
                se på filen i økten din.
              </Alert>
            )}
          </div>
        )}

        {media && media.type === MediaType.RICH_TEXT && (
          <div className='relative p-2'>
            <TextViewer name='media' content={media.content as any} />
          </div>
        )}
      </PageLayout>
    </>
  );
};

export default MediaView;
