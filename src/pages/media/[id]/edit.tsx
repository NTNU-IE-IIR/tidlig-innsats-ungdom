import PageLayout from '@/components/layout/PageLayout';
import MediaEditor from '@/components/media/MediaEditor';
import { api } from '@/utils/api';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const EditMediaPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const mediaId = Number(id);
  const { data: initialMedia } = api.media.getById.useQuery(mediaId, {
    enabled: !Number.isNaN(mediaId),
  });

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout className='grid grid-cols-3 px-1'>
        {initialMedia && <MediaEditor existingMedia={initialMedia} />}
      </PageLayout>
    </>
  );
};

export default EditMediaPage;
