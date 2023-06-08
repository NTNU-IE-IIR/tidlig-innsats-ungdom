import { TenantRole, UserAccountRole } from '@/server/db/schema';
import { useTenantStore } from '@/store/tenantStore';
import { Menu } from '@headlessui/react';
import { IconChevronDown, IconLogout, IconUser } from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';

const NavigationBar = () => {
  const { data } = useSession();
  return (
    <header className='flex items-center justify-between border-b-2 border-zinc-400'>
      <nav className='-mb-0.5 flex items-center self-end'>
        <NavigationLink href='/'>Temautforsker</NavigationLink>
        <NavigationLink
          tenantRoles={[TenantRole.OWNER, TenantRole.SUPER_USER]}
          href='/media'
        >
          Innholdsadministrasjon
        </NavigationLink>
        <NavigationLink tenantRoles={[TenantRole.OWNER]} href='/settings'>
          Innstillinger
        </NavigationLink>
      </nav>

      <Menu as='div' className='relative'>
        <Menu.Button className='m-1 flex cursor-pointer items-center gap-1 rounded-md border-black/10 bg-white p-1 shadow hover:bg-zinc-100'>
          <div className='h-5 w-5 rounded-full bg-zinc-800' />

          <span className='text-sm font-medium'>
            {data?.user.name?.split(' ')[0]}
          </span>

          <IconChevronDown className='h-4 w-4 transform transition-transform ui-open:rotate-180' />
        </Menu.Button>

        <Menu.Items className='absolute right-1 top-full mt-1 divide-y rounded-md border border-black/10 bg-white shadow'>
          <Menu.Item
            as={Link}
            href='/profile'
            className='flex w-full items-center gap-1 rounded-t-md px-2 py-1 transition-colors hover:bg-zinc-100'
          >
            <IconUser className='h-4 w-4' />
            <span className='text-sm font-medium'>Profil</span>
          </Menu.Item>
          <Menu.Item
            as='button'
            onClick={() => signOut()}
            className='flex w-full items-center gap-1 rounded-b-md px-2 py-1 transition-colors hover:bg-zinc-100 hover:text-red-600'
          >
            <IconLogout className='h-4 w-4' />
            <span className='text-sm font-medium'>Logg ut</span>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </header>
  );
};

const NavigationLink: React.FC<{
  href: string;
  children: string;
  tenantRoles?: TenantRole[];
  userRoles?: UserAccountRole[];
}> = ({ href, children, tenantRoles, userRoles }) => {
  const router = useRouter();

  const { activeTenantRole } = useTenantStore();
  const { data: session } = useSession();

  if (tenantRoles && !tenantRoles.includes(activeTenantRole!)) return null;
  if (userRoles && !userRoles.includes(session?.user.role!)) return null;

  return (
    <ul>
      <li
        className={twMerge(
          'border-b-2 px-2 font-semibold',
          router.pathname === href ? 'border-emerald-500' : 'border-transparent'
        )}
      >
        <Link href={href}>{children}</Link>
      </li>
    </ul>
  );
};

export default NavigationBar;
