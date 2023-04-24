import clsx from 'clsx';

interface ButtonProps {
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  className,
  type,
  children,
  isLoading,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={() => onClick?.()}
      className={clsx(
        'relative flex justify-center items-center gap-2 rounded-md border-emerald-700 bg-emerald-500 px-2 py-1 text-white outline-none transition-colors hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-700',
        className
      )}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
          <svg
            className='h-5 w-5 animate-spin'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              stroke-width='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        </div>
      )}

      <div className={clsx(isLoading && 'invisible')}>{children}</div>
    </button>
  );
};

export default Button;
