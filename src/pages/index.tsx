import Card from '@/components/container/Card';
import PageLayout from '@/components/layout/PageLayout';
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useHotkeys } from '@mantine/hooks';
import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRef } from 'react';

const Home: NextPage = () => {
  const searchBarRef = useRef<HTMLInputElement>(null);

  useHotkeys([['ctrl+k', () => searchBarRef.current?.focus()]]);

  return (
    <>
      <Head>
        <title>Tidlig innsats ungdom</title>
      </Head>
      <PageLayout>
        <div className='flex items-center justify-center gap-1 py-2 font-semibold'>
          <HomeIcon className='h-5 w-5' />
          <span>/</span>
          <Link href=''>Angst</Link>
        </div>

        <h1 className='my-4 text-center text-2xl font-bold'>
          Velg eller søk på tema og innhold
        </h1>

        <div className='flex items-center justify-center'>
          <div className='relative'>
            <MagnifyingGlassIcon className='pointer-events-none absolute left-1.5 top-1/2 h-4 w-4 -translate-y-1/2' />
            <input
              type='text'
              ref={searchBarRef}
              className='w-80 rounded-md border border-zinc-950 bg-transparent py-1 pl-6 pr-16 outline-none ring-zinc-950 placeholder:text-zinc-950 focus:ring-1'
              placeholder='Søk...'
            />

            {/* Key combination pills */}
            <div className='pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-px text-[10px] font-semibold'>
              <span className='rounded-sm border border-zinc-950 px-0.5'>
                CTRL
              </span>
              <span>+</span>
              <span className='rounded-sm border border-zinc-950 px-0.5'>
                K
              </span>
            </div>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-3 gap-2 px-4'>
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className='flex aspect-[1.5/1] cursor-pointer flex-col items-center justify-center transition-all hover:scale-[1.025]'
            >
              <h3 className='text-xl font-bold'>Tema {i + 1}</h3>
              <p className='text-sm'>Beskrivelse</p>
            </Card>
          ))}
        </div>
      </PageLayout>
    </>
  );
};

export default Home;
