import { ChevronDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NavigationBar = () => {
  const { data } = useSession();
  return (
    <header className='flex items-center justify-between border-b-2 border-zinc-500'>
      <nav className='-mb-0.5 flex items-center self-end'>
        <NavigationLink href='/'>Temautforsker</NavigationLink>
        <NavigationLink href='/manage'>Tema administrasjon</NavigationLink>
      </nav>

      <div className='m-1 flex cursor-pointer items-center gap-1 rounded-md border-black/10 bg-white p-1 shadow hover:bg-zinc-100'>
        <div className='h-5 w-5 rounded-full bg-zinc-800' />

        <span className='text-sm font-medium'>
          {data?.user.name?.split(' ')[0]}
        </span>

        <ChevronDownIcon className='h-4 w-4' />
      </div>
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
