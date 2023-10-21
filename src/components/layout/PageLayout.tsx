import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import { Transition } from '@headlessui/react';
import { useHotkeys } from '@mantine/hooks';
import getConfig from 'next/config';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import NavigationBar from '../navigation/NavigationBar';
import NavigationMenu from '../navigation/NavigationMenu';
import SlideOverPanel from '../overlay/SlideOverPanel';
import SessionSideMenu from '../session/SessionSideMenu';

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
  const sideMenuRef = useRef<HTMLElement>();

  /**
   * Hydrate the session store from local storage, resulting in the side menu opening (or staying closed)
   * based on the previous state saved to local storage.
   */
  useEffect(() => {
    useSessionStore.persist.rehydrate();
    sideMenuRef.current?.classList.add('w-96'); // has to be done to retain the size of the side menu when navigating between pages
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
    <div className='relative flex h-screen w-screen overflow-hidden print:overflow-visible'>
      <div className='relative flex min-h-screen flex-1 flex-col overflow-y-auto print:overflow-visible'>
        <NavigationBar onShowMobileNavigation={() => setShowMobileNav(true)} />

        <div className='mx-auto flex h-fit w-full max-w-screen-xl flex-1 flex-col gap-2 py-2 pb-5'>
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
      </div>

      <Transition
        show={showSideMenu}
        // @ts-ignore
        ref={sideMenuRef}
        enter='transition-all duration-300 ease-out'
        enterFrom='transform w-0 opacity-0'
        enterTo='transform w-96 opacity-100'
        leave='transition-all duration-300 ease-out'
        leaveFrom='transform w-96 opacity-100'
        leaveTo='transform w-0 opacity-0'
        className='flex-shrink-0 overflow-hidden print:hidden'
      >
        <SessionSideMenu />
      </Transition>
    </div>
  );
};

export default PageLayout;
