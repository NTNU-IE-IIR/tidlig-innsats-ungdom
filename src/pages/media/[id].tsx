import TextViewer from '@/components/editor/TextViewer';
import PageLayout from '@/components/layout/PageLayout';
import { api } from '@/utils/api';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MediaView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: media, isError } = api.media.getById.useQuery(Number(id), {
    enabled: !Number.isNaN(id),
  });

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        {isError && <p></p>}

        {media && <TextViewer name='media' content={media.content as any} />}
      </PageLayout>
    </>
  );
};

export default MediaView;
