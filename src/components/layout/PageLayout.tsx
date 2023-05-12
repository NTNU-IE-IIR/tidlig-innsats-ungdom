import { useSessionStore } from '@/store/sessionStore';
import { Transition } from '@headlessui/react';
import { useHotkeys } from '@mantine/hooks';
import { IconChevronLeft } from '@tabler/icons-react';
import clsx from 'clsx';
import NavigationBar from '../navigation/NavigationBar';
import SessionSideMenu from '../session/SessionSideMenu';

interface PageLayoutProps {
  children: React.ReactNode;
  /**
   * Classes applied to the content root element.
   * This is the parent of the children prop.
   */
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  const { showSideMenu, toggleSideMenu, closeSideMenu } = useSessionStore();

  useHotkeys([
    ['ctrl+space', () => toggleSideMenu()],
    ['escape', () => closeSideMenu()],
  ]);

  return (
    <div className='relative flex h-screen w-screen overflow-hidden'>
      <div className='relative flex-1 overflow-y-auto'>
        <div className='mx-auto flex h-fit min-h-screen max-w-screen-xl flex-col gap-2 py-5'>
          <NavigationBar />

          <main className={clsx('flex-1', className)}>{children}</main>

          <footer className='self-center'>
            <span className='text-sm font-semibold uppercase'>
              tidlig innsats ungdom © {new Date().getFullYear()}
            </span>
          </footer>
        </div>

        <button
          type='button'
          className='absolute right-0 top-0 mt-0.5 flex items-center self-start'
          onClick={toggleSideMenu}
        >
          <IconChevronLeft
            className={clsx(
              'h-5 w-5 transform transition-transform',
              showSideMenu && 'rotate-180'
            )}
          />
          <span className='pr-2 text-sm font-semibold'>
            {!showSideMenu ? 'Åpne øktoversikt' : 'Lukk øktoversikt'}
          </span>
        </button>
      </div>

      <Transition
        show={showSideMenu}
        enter='transition-all duration-300 ease-out'
        enterFrom='transform w-0 opacity-0'
        enterTo='transform w-96 opacity-100'
        leave='transition-all duration-300 ease-out'
        leaveFrom='transform w-96 opacity-100'
        leaveTo='transform w-0 opacity-0'
        className='overflow-hidden w-96'
      >
        <div className='flex h-screen overflow-y-auto border-l border-black/10 bg-white px-2 pb-2 pt-1'>
          <SessionSideMenu />
        </div>
      </Transition>
    </div>
  );
};

export default PageLayout;
