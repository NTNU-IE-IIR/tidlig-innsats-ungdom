import {
  IconFiles,
  IconHelpCircle,
  IconLayoutDashboard,
  IconListDetails,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NavigationMenuProps {
  onNavigate: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onNavigate }) => {
  const { data: session } = useSession();
  return (
    <nav className='mt-2 flex h-full flex-col'>
      <h1 className='text-lg font-bold'>Navigasjon</h1>

      <ul className='flex flex-1 flex-col gap-2'>
        <li>
          <NavigationItem
            icon={IconLayoutDashboard}
            href='/'
            name='Temautforsker'
            onNavigate={onNavigate}
          />
        </li>
        <li>
          <NavigationItem
            icon={IconFiles}
            href='/media'
            name='Innholdsadministrasjon'
            onNavigate={onNavigate}
          />
        </li>
        <li>
          <NavigationItem
            icon={IconSettings}
            href='/settings'
            name='Innstillinger'
            onNavigate={onNavigate}
          />
        </li>
        <li>
          <NavigationItem
            icon={IconHelpCircle}
            href='/about'
            name='Hjelp'
            onNavigate={onNavigate}
          />
        </li>
      </ul>

      <div className='flex items-center gap-2 rounded-md border p-1'>
        <div className='h-7 w-7 rounded-full bg-gray-800' />

        <div className='flex-1'>
          <span className='block text-sm font-semibold'>
            {session?.user.name}
          </span>
          <span className='-mt-1 block text-xs'>{session?.user.email}</span>
        </div>

        <IconLogout className='text-gray-600' />
      </div>
    </nav>
  );
};

interface NavigationItemProps {
  icon: typeof IconListDetails;
  href: string;
  name: string;
  onNavigate: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon: Icon,
  href,
  name,
  onNavigate,
}) => {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className='border-gray-3001 flex items-center gap-1 rounded-md border p-1'
    >
      <Icon className='h-6 w-6' />
      <span className='text-lg font-medium'>{name}</span>
    </Link>
  );
};

export default NavigationMenu;
