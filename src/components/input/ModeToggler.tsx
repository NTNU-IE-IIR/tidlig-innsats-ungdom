import { twMerge } from 'tailwind-merge';

export interface ModeTogglerProps {
  children: (typeof ModeTogglerMode)[];
}

const ModeToggler = ({ children }: ModeTogglerProps) => {
  return (
    <div className='grid grid-cols-2 items-center divide-x divide-black/20 rounded-md border border-black/20 bg-white text-sm shadow'></div>
  );
};

interface ModeTogglerModeProps {
  children: React.ReactNode;
  active?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

const ModeTogglerMode = ({
  children,
  active,
  isFirst,
  isLast,
  onClick,
}: ModeTogglerModeProps) => {
  return (
    <button
      onClick={onClick}
      type='button'
      className={twMerge(
        'px-2 py-0.5 font-medium',
        active && 'text-emerald-900, bg-emerald-50',
        isFirst && 'rounded-l-md',
        isLast && 'rounded-r-md'
      )}
    >
      {children}
    </button>
  );
};

export default ModeToggler;
