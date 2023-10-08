import { TenantRole, UserAccountRole } from '@/server/db/schema';
import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { Menu } from '@headlessui/react';
import {
  IconArrowBarLeft,
  IconChevronDown,
  IconDashboard,
  IconFiles,
  IconHelp,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';
import Tooltip from '../feedback/Tooltip';
import Button from '../input/Button';

export interface NavigationBarProps {
  onShowMobileNavigation?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onShowMobileNavigation,
}) => {
  const { data } = useSession();
  const router = useRouter();
  const { showSideMenu, toggleSideMenu } = useSessionStore();

  const onHelp = () => {
    router.push('/about');
  };

  return (
    <header className='header-grid-columns grid gap-1 border-b border-primary-600 bg-primary-500 print:hidden z-10'>
      <div className='flex-1 basis-0'>
        <span className='sr-only'>Tidlig innsats ungdom</span>
      </div>

      <div className='my-1 flex items-center justify-between @container max-md:invisible'>
        <nav>
          <ul className='flex items-center gap-1'>
            <NavigationLink icon={IconLayoutDashboard} href='/'>
              Temautforsker
            </NavigationLink>
            <NavigationLink
              icon={IconFiles}
              tenantRoles={[TenantRole.OWNER, TenantRole.SUPER_USER]}
              href='/media'
            >
              Innholdsadministrasjon
            </NavigationLink>
            <NavigationLink
              icon={IconSettings}
              tenantRoles={[TenantRole.OWNER]}
              href='/settings'
            >
              Innstillinger
            </NavigationLink>
          </ul>
        </nav>

        <div className='flex items-center gap-1'>
          <Tooltip content='Vis hjelp'>
            <Button
              variant='neutral'
              className='border-primary-700 bg-primary-600 px-0.5 py-0.5 text-primary-50 hover:bg-primary-700 focus:ring-primary-700'
              onClick={onHelp}
            >
              <IconHelp />
              <span className='sr-only'>Vis hjelp</span>
            </Button>
          </Tooltip>

          <Menu as='div' className='relative'>
            <Menu.Button className='flex cursor-pointer items-center gap-1 rounded-md border border-primary-700 bg-primary-600 p-1 text-primary-50 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700'>
              <div className='h-5 w-5 rounded-full bg-primary-950' />

              <span className='hidden text-sm @xl:block'>
                {data?.user.name?.split(' ')[0]}
              </span>

              <IconChevronDown className='h-4 w-4 transform transition-transform ui-open:rotate-180' />
            </Menu.Button>

            <Menu.Items className='absolute right-1 top-full z-[999] mt-1 divide-y rounded-md border border-black/10 bg-white shadow'>
              <Menu.Item
                as={Link}
                href='/profile'
                className='flex w-full items-center gap-1 rounded-t-md px-2 py-1 transition-colors hover:bg-gray-100'
              >
                <IconUser className='h-4 w-4' />
                <span className='whitespace-nowrap text-sm font-medium'>
                  Profil
                </span>
              </Menu.Item>
              <Menu.Item
                as='button'
                onClick={() => signOut()}
                className='flex w-full items-center gap-1 rounded-b-md px-2 py-1 transition-colors hover:bg-gray-100 hover:text-error-600'
              >
                <IconLogout className='h-4 w-4' />
                <span className='whitespace-nowrap text-sm font-medium'>
                  Logg ut
                </span>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      <div className='flex flex-1 basis-0 items-center justify-end pr-1'>
        <Tooltip
          content={!showSideMenu ? 'Åpne øktoversikt' : 'Lukk øktoversikt'}
        >
          <Button
            variant='neutral'
            className='h-fit border-primary-700 bg-primary-600 px-0.5 py-0.5 text-primary-50 hover:bg-primary-700 focus:ring-primary-700 max-md:hidden'
            onClick={toggleSideMenu}
          >
            <IconArrowBarLeft
              className={twMerge(
                'transition-all',
                showSideMenu && 'rotate-180'
              )}
            />
            <span className='sr-only'>
              {!showSideMenu ? 'Åpne øktoversikt' : 'Lukk øktoversikt'}
            </span>
          </Button>
        </Tooltip>
      </div>

      <Button
        variant='neutral'
        className='absolute right-2 top-1.5 h-fit self-center border-primary-700 bg-primary-600 px-0.5 py-0.5 text-primary-50 hover:bg-primary-700 focus:ring-primary-700 md:hidden'
        onClick={onShowMobileNavigation}
      >
        <IconMenu2 />
        <span className='sr-only'>Vis navigasjonsmeny</span>
      </Button>
    </header>
  );
};

const NavigationLink: React.FC<{
  href: string;
  children: string;
  icon: typeof IconMenu2;
  tenantRoles?: TenantRole[];
  userRoles?: UserAccountRole[];
}> = ({ href, icon: Icon, children, tenantRoles, userRoles }) => {
  const router = useRouter();

  const { activeTenantRole } = useTenantStore();
  const { data: session } = useSession();

  if (tenantRoles && !tenantRoles.includes(activeTenantRole!)) return null;
  if (userRoles && !userRoles.includes(session?.user.role!)) return null;

  return (
    <li>
      <Link
        href={href}
        className={twMerge(
          'flex items-center gap-1 rounded-md py-1.5 pl-1 pr-2 text-sm text-primary-50 transition-colors hover:bg-primary-600 focus:bg-primary-600 focus:outline-none',
          router.pathname === href &&
            'bg-primary-700 text-primary-50 hover:bg-primary-700 focus:bg-primary-700'
        )}
      >
        <Icon />
        <span className='hidden @xl:block'>{children}</span>
      </Link>
    </li>
  );
};

export default NavigationBar;
