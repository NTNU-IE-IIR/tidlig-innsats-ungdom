import { Transition } from '@headlessui/react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useHotkeys } from '@mantine/hooks';
import clsx from 'clsx';
import { useState } from 'react';
import NavigationBar from '../navigation/NavigationBar';
import SessionSideMenu from '../session/SessionSideMenu';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [showSideMenu, setShowSideMenu] = useState(false);

  useHotkeys([
    ['ctrl+space', () => setShowSideMenu((isShowing) => !isShowing)],
    ['escape', () => setShowSideMenu(false)],
  ]);

  return (
    <div className='relative flex min-h-screen overflow-hidden'>
      <div className='mx-auto flex min-h-screen max-w-screen-xl flex-1 flex-col overflow-y-auto py-4'>
        <NavigationBar />

        <main className='flex-1'>{children}</main>

        <footer className='self-center'>
          <span className='text-sm font-semibold uppercase'>
            tidlig innsats ungdom © {new Date().getFullYear()}
          </span>
        </footer>
      </div>

      <button
        type='button'
        className='mt-2 flex items-center self-start'
        onClick={() => setShowSideMenu((isShowing) => !isShowing)}
      >
        <ChevronLeftIcon
          className={clsx(
            'h-5 w-5 transform transition-transform',
            showSideMenu && 'rotate-180'
          )}
        />
        <span className='pr-2 text-sm font-semibold'>
          {!showSideMenu ? 'Åpne øktoversikt' : 'Lukk øktoversikt'}
        </span>
      </button>

      <Transition
        show={showSideMenu}
        enter='transition-all duration-300 ease-out'
        enterFrom='transform w-0 opacity-0'
        enterTo='transform w-1/5 opacity-100'
        leave='transition-all duration-300 ease-out'
        leaveFrom='transform w-1/5 opacity-100'
        leaveTo='transform w-0 opacity-0'
        className='overflow-hidden'
      >
        <div className='flex h-screen overflow-y-auto border-l border-black/10 bg-white px-2 pb-2 pt-1'>
          <SessionSideMenu />
        </div>
      </Transition>
    </div>
  );
};

export default PageLayout;
