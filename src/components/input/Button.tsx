import { VariantProps, cva } from 'class-variance-authority';
import clsx from 'clsx';

const button = cva(
  [
    'relative flex items-center justify-center gap-2 rounded-md  px-2 py-1 text-white outline-none transition-colors focus:ring-2',
  ],
  {
    variants: {
      variant: {
        primary:
          'border-emerald-700 bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-700',
        destructive:
          'border-red-700 bg-red-500 hover:bg-red-600 focus:ring-red-700',
        neutral:
          'text-zinc-950 border border-zinc-300 hover:bg-zinc-100 focus:ring-zinc-200',
      },
      disabled: {
        true: 'bg-opacity-50 hover:bg-opacity-70 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

interface ButtonProps extends VariantProps<typeof button> {
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  className,
  type = 'button',
  children,
  isLoading,
  onClick,
  variant,
  disabled,
}) => {
  return (
    <button
      type={type}
      onClick={() => onClick?.()}
      disabled={disabled ?? undefined}
      className={clsx(button({ variant, disabled }), className)}
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
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        </div>
      )}

      <div
        className={clsx('flex items-center gap-1', isLoading && 'invisible')}
      >
        {children}
      </div>
    </button>
  );
};

export default Button;
