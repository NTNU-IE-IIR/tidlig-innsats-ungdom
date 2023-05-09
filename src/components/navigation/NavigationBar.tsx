import { Menu } from '@headlessui/react';
import { IconChevronDown, IconLogout, IconUser } from '@tabler/icons-react';
import clsx from 'clsx';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NavigationBar = () => {
  const { data } = useSession();
  return (
    <header className='flex items-center justify-between border-b-2 border-zinc-400'>
      <nav className='-mb-0.5 flex items-center self-end'>
        <NavigationLink href='/'>Temautforsker</NavigationLink>
        <NavigationLink href='/manage'>Tema administrasjon</NavigationLink>
        <NavigationLink href='/settings'>Innstillinger</NavigationLink>
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
            as='button'
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

const NavigationLink: React.FC<{ href: string; children: string }> = ({
  href,
  children,
}) => {
  const router = useRouter();

  return (
    <ul>
      <li
        className={clsx(
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
