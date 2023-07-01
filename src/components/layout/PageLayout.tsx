import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import { Transition } from '@headlessui/react';
import { useHotkeys } from '@mantine/hooks';
import { IconChevronLeft, IconList, IconMenu2 } from '@tabler/icons-react';
import getConfig from 'next/config';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import NavigationBar from '../navigation/NavigationBar';
import NavigationMenu from '../navigation/NavigationMenu';
import SlideOverPanel from '../overlay/SlideOverPanel';
import SessionSideMenu from '../session/SessionSideMenu';
import Button from '../input/Button';

interface PageLayoutProps {
  children: React.ReactNode;
  /**
   * Classes applied to the content root element.
   * This is the parent of the children prop.
   */
  className?: string;
}

const { publicRuntimeConfig } = getConfig();

const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  const { data: tenants } = api.tenant.listMyTenants.useQuery();
  const { setActiveTenant } = useTenantStore();
  const { showSideMenu, toggleSideMenu, closeSideMenu } = useSessionStore();

  /**
   * Hydrate the session store from local storage, resulting in the side menu opening (or staying closed)
   * based on the previous state saved to local storage.
   */
  useEffect(() => {
    useSessionStore.persist.rehydrate();
  }, []);

  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    if (tenants && tenants.length >= 1) {
      const tenant = tenants[0]!;
      setActiveTenant(tenant.id, tenant.name, tenant.role);
    }
  }, [tenants]);

  useHotkeys([
    ['ctrl+space', () => toggleSideMenu()],
    ['escape', () => closeSideMenu()],
  ]);

  return (
    <div className='relative flex h-screen w-screen overflow-hidden'>
      <div className='relative flex-1 overflow-y-auto'>
        <div className='mx-auto flex h-fit min-h-screen max-w-screen-xl flex-col gap-2 py-5'>
          <NavigationBar />

          <Button
            className='mt-1 w-fit self-end bg-white md:hidden print:hidden'
            variant='neutral'
            onClick={() => setShowMobileNav(true)}
          >
            <IconMenu2 />
          </Button>

          <SlideOverPanel
            open={showMobileNav}
            onClose={() => setShowMobileNav(false)}
          >
            <NavigationMenu onNavigate={() => setShowMobileNav(false)} />
          </SlideOverPanel>

          <main className={twMerge('flex-1', className)}>{children}</main>

          <footer className='self-center print:hidden'>
            <span className='block text-sm font-semibold uppercase'>
              Tidlig innsats ungdom © {new Date().getFullYear()}
            </span>
            <span className='block text-center text-xs font-medium'>
              Versjon {publicRuntimeConfig.version}
            </span>
          </footer>
        </div>

        <button
          type='button'
          className='absolute right-0 top-0 mt-0.5 flex items-center self-start print:hidden'
          onClick={toggleSideMenu}
        >
          <IconChevronLeft
            className={twMerge(
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
        className='w-96 overflow-hidden print:hidden'
      >
        <SessionSideMenu />
      </Transition>
    </div>
  );
};

export default PageLayout;
