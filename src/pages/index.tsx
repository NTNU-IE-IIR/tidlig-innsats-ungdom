import Card from '@/components/container/Card';
import PageLayout from '@/components/layout/PageLayout';
import { RouterOutputs, api } from '@/utils/api';
import { useDebouncedValue, useHotkeys } from '@mantine/hooks';
import { IconCloudPlus, IconHome, IconSearch } from '@tabler/icons-react';
import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useRef, useState } from 'react';

type Content = RouterOutputs['content']['listContent'][number];

const Home: NextPage = () => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput] = useDebouncedValue(searchInput, 500);
  const [themeDrill, setThemeDrill] = useState<Content[]>([]);

  useHotkeys([['ctrl+k', () => searchBarRef.current?.focus()]]);

  const { data: themes } = api.content.listContent.useQuery({
    name: debouncedSearchInput,
    parentId: themeDrill[themeDrill.length - 1]?.id,
  });

  const router = useRouter();

  const appendTheme = (theme: Content) => {
    if (theme.discriminator === 'MEDIA') {
      return router.push(`/media/${theme.id}`);
    }

    setThemeDrill((prev) => [...prev, theme]);
  };

  const navigateHome = () => {
    setThemeDrill([]);
  };

  const navigateBackTo = (theme: Content, i: number) => {
    setThemeDrill((prev) => prev.slice(0, i).concat(theme));
  };

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <div className='flex items-center justify-center gap-1 py-2 font-semibold'>
          <button onClick={navigateHome}>
            <IconHome className='h-5 w-5' />
          </button>
          {themeDrill.map((theme, i) => (
            <Fragment key={theme.id}>
              <span>/</span>
              <button onClick={() => navigateBackTo(theme, i)}>
                {theme.name}
              </button>
            </Fragment>
          ))}
        </div>

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
          {!themes ||
            (themes.length === 0 && (
              <Link
                href='/manage'
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

          {themes?.map((theme) => (
            <Card
              onClick={() => appendTheme(theme)}
              key={theme.discriminator + theme.id}
              className='flex aspect-[1.5/1] cursor-pointer flex-col items-center justify-center transition-all hover:scale-[1.025]'
            >
              <h3 className='text-xl font-bold'>{theme.name}</h3>
              <p className='text-sm'>Beskrivelse</p>
            </Card>
          ))}
        </div>
      </PageLayout>
    </>
  );
};

export default Home;
