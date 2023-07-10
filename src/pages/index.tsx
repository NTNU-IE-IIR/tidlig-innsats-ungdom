import Card from '@/components/container/Card';
import Tooltip from '@/components/feedback/Tooltip';
import PageLayout from '@/components/layout/PageLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useBrowseStore } from '@/store/browseStore';
import { ContentDiscriminator, FavoriteType } from '@/types/content';
import { api } from '@/utils/api';
import { useDebouncedValue, useHotkeys } from '@mantine/hooks';
import {
  IconCloudPlus,
  IconFolderFilled,
  IconListDetails,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconStarHalfFilled,
} from '@tabler/icons-react';
import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const Home: NextPage = () => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput] = useDebouncedValue(searchInput, 500);

  useHotkeys([['ctrl+k', () => searchBarRef.current?.focus()]]);

  const router = useRouter();
  const { drill, appendContent, navigateBackTo } = useBrowseStore();

  const parent = drill[drill.length - 1];

  const { data: content } = api.content.listContent.useQuery({
    name: debouncedSearchInput,
    parentId: parent?.discriminator === 'THEME' ? parent.id : undefined,
    favoritesOnly: showFavoritesOnly,
  });

  useEffect(() => {
    if (parent?.discriminator === 'MEDIA') {
      navigateBackTo(drill[drill.length - 2]!, drill.length - 2, router);
    }
  }, []);

  const utils = api.useContext();

  const { mutateAsync: toggleFavorization } =
    api.content.toggleFavoriteContent.useMutation({
      onSuccess: () => {
        utils.content.listContent.invalidate();
      },
    });

  const toggleContentFavorization = async (
    id: number,
    discriminator: ContentDiscriminator,
    favorited: FavoriteType
  ) => {
    await toggleFavorization({
      id,
      discriminator,
      favorited: favorited === 'DIRECT',
    });
  };

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <Breadcrumbs />

        <h1 className='mb-2 mt-4 text-center text-2xl font-bold'>
          Velg eller søk på tema og innhold
        </h1>

        <div className='mb-3 flex items-center justify-center'>
          <div className='grid grid-cols-2 items-center divide-x divide-black/20 rounded-md border border-black/20 bg-white text-sm shadow'>
            <button
              type='button'
              className={twMerge(
                'rounded-l-md px-2 py-0.5 font-medium',
                !showFavoritesOnly && 'bg-emerald-50 text-emerald-900'
              )}
              onClick={() => setShowFavoritesOnly(false)}
            >
              Alt innhold
            </button>
            <button
              type='button'
              className={twMerge(
                'rounded-r-md px-2 py-0.5 font-medium',
                showFavoritesOnly && 'bg-emerald-50 text-emerald-900'
              )}
              onClick={() => setShowFavoritesOnly(true)}
            >
              Kun favoritter
            </button>
          </div>
        </div>

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

        <div className='relative mt-4 grid grid-cols-1 gap-2 px-4'>
          {!content ||
            (content.themes.length === 0 && content.medias.length === 0 && (
              <Link
                href='/media/new'
                className='mx-auto my-32 flex max-w-xs flex-col items-center text-center text-zinc-500 transition-colors hover:text-zinc-600'
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

          <div className='grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3'>
            {content?.themes.map((theme) => (
              <Card
                pad={false}
                key={'THEME' + theme.id}
                onClick={() => appendContent(theme, router)}
                className='flex h-14 cursor-pointer items-center gap-2 px-2 transition-all hover:scale-[1.01]'
              >
                <IconFolderFilled className='h-8 w-8 flex-shrink-0 text-zinc-700' />

                <div className='flex h-full flex-1 flex-col justify-center overflow-hidden'>
                  <h3 className='truncate font-semibold'>{theme.name}</h3>
                  <p className='truncate text-sm'>{theme.shortDescription}</p>
                </div>

                <FavoriteContentButton
                  favorited={theme.favorited}
                  onToggle={() =>
                    toggleContentFavorization(
                      theme.id,
                      theme.discriminator,
                      theme.favorited
                    )
                  }
                />
              </Card>
            ))}
          </div>

          <div className='grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3'>
            {content?.medias.map((media) => (
              <Card
                variant='media'
                onClick={() => appendContent(media, router)}
                key={'MEDIA' + media.id}
                className='relative flex aspect-[1.5/1] cursor-pointer flex-col items-center justify-center text-center transition-all hover:scale-[1.01]'
              >
                <IconListDetails className='h-10 w-10 text-zinc-700' />

                <h3 className='truncate text-xl font-bold'>{media.name}</h3>
                <p className='line-clamp-2 text-sm font-medium'>
                  {media.shortDescription}
                </p>

                <FavoriteContentButton
                  favorited={media.favorited}
                  className='absolute right-3 top-3'
                  onToggle={() =>
                    toggleContentFavorization(
                      media.id,
                      media.discriminator,
                      media.favorited
                    )
                  }
                />
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

interface FavoriteContentButtonProps {
  favorited: FavoriteType;
  onToggle: () => void;
  className?: string;
}

const FavoriteContentButton: React.FC<FavoriteContentButtonProps> = ({
  favorited,
  onToggle,
  className,
}) => {
  const onFavoriteClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onToggle();
  };

  let tooltipContent = (
    <p className='text-center'>
      {favorited === 'DIRECT' && 'Fjern favorisering'}
      {favorited === 'INDIRECT' && (
        <>
          Merk som favoritt
          <br />
          <span className='text-xs'>(inneholder favorisert underinnhold)</span>
        </>
      )}
      {favorited === 'NONE' && 'Merk som favoritt'}
    </p>
  );

  return (
    <Tooltip content={tooltipContent}>
      <button
        type='button'
        onClick={onFavoriteClick}
        className={twMerge(
          'rounded-full border border-transparent p-0.5 hover:border-zinc-300 hover:bg-zinc-200 focus:border-zinc-300 focus:bg-zinc-200 focus:outline-none',
          className
        )}
      >
        {favorited === 'DIRECT' && (
          <IconStarFilled className='h-5 w-5 text-yellow-600' />
        )}
        {favorited === 'INDIRECT' && (
          <IconStarHalfFilled className='h-5 w-5 text-yellow-600' />
        )}
        {favorited === 'NONE' && <IconStar className='h-5 w-5 text-zinc-800' />}
        <span className='sr-only'>Merk som favoritt</span>
      </button>
    </Tooltip>
  );
};

export default Home;
