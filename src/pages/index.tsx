import Card from '@/components/container/Card';
import PageLayout from '@/components/layout/PageLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useBrowseStore } from '@/store/browseStore';
import { api } from '@/utils/api';
import { useDebouncedValue, useHotkeys } from '@mantine/hooks';
import {
  IconCloudPlus,
  IconFolder,
  IconFolderFilled,
  IconListDetails,
  IconSearch,
} from '@tabler/icons-react';
import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const Home: NextPage = () => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput] = useDebouncedValue(searchInput, 500);

  useHotkeys([['ctrl+k', () => searchBarRef.current?.focus()]]);

  const router = useRouter();
  const { drill, appendContent, navigateBackTo } = useBrowseStore();

  const parent = drill[drill.length - 1];

  const { data: content } = api.content.listContent.useQuery({
    name: debouncedSearchInput,
    parentId: parent?.discriminator === 'THEME' ? parent.id : undefined,
  });

  useEffect(() => {
    if (parent?.discriminator === 'MEDIA') {
      navigateBackTo(drill[drill.length - 2]!, drill.length - 2, router);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <Breadcrumbs />

        <h1 className='my-4 text-center text-2xl font-bold'>
          Velg eller søk på tema og innhold
        </h1>

        <div className='flex items-center justify-center'>
          <div className='relative'>
            <IconSearch className='pointer-events-none absolute left-1.5 top-1/2 h-4 w-4 -translate-y-1/2' />
            <input
              type='text'
              ref={searchBarRef}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className='w-80 rounded-md border border-black/20 bg-zinc-50 py-1 pl-6 pr-16 shadow outline-none transition-colors placeholder:text-zinc-950 focus:border-zinc-600 focus:ring-0'
              placeholder='Søk...'
            />

            {/* Key combination pills */}
            <div className='pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-px text-[10px] font-semibold'>
              <span className='rounded-md border border-zinc-400 bg-zinc-200 px-1'>
                CTRL
              </span>
              <span>+</span>
              <span className='rounded-md border border-zinc-400 bg-zinc-200 px-1'>
                K
              </span>
            </div>
          </div>
        </div>

        <div className='relative mt-4 grid grid-cols-3 gap-2 px-4'>
          {!content ||
            (content.themes.length === 0 && content.medias.length === 0 && (
              <Link
                href='/media/new'
                className='col-span-3 mx-auto my-32 flex max-w-xs flex-col items-center text-center text-zinc-500 transition-colors hover:text-zinc-600'
              >
                <IconCloudPlus className='h-24 w-24' />
                <p className='text-sm font-semibold'>
                  {debouncedSearchInput.length > 0
                    ? 'Kunne ikke finne innhold for søket ditt.'
                    : 'Her var det tomt.'}
                  <br />
                  Klikk for å legge til nytt innhold.
                </p>
              </Link>
            ))}

          <div className='col-span-3 grid grid-cols-[inherit] gap-2'>
            {content?.themes.map((theme) => (
              <Card
                key={'THEME' + theme.id}
                onClick={() => appendContent(theme, router)}
                className='flex aspect-[6/1] cursor-pointer items-center gap-2 transition-all hover:scale-[1.01]'
              >
                <IconFolderFilled className='h-8 w-8 text-zinc-700' />
                <div className='-mt-2'>
                  <h3 className='truncate font-semibold'>{theme.name}</h3>
                  <p className='-my-1 truncate text-sm'>
                    {theme.shortDescription}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className='col-span-3 grid grid-cols-[inherit] gap-2'>
            {content?.medias.map((media) => (
              <Card
                variant='media'
                onClick={() => appendContent(media, router)}
                key={'MEDIA' + media.id}
                className='flex aspect-[1.5/1] cursor-pointer flex-col items-center justify-center transition-all hover:scale-[1.01]'
              >
                <IconListDetails className='-mt-12 h-12 w-12 text-zinc-700' />
                <h3 className='text-xl font-bold'>{media.name}</h3>
                <p className='text-sm font-medium'>{media.shortDescription}</p>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default Home;
