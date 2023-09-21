import { VariantProps, cva } from 'class-variance-authority';
import { ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const button = cva(
  [
    'relative flex items-center justify-center gap-2 rounded-md  px-2 py-1 text-white outline-none transition-colors focus:ring-2',
  ],
  {
    variants: {
      variant: {
        primary:
          'border-primary-700 bg-primary-500 hover:bg-primary-600 focus:ring-primary-700',
        destructive:
          'border-error-700 bg-error-500 hover:bg-error-600 focus:ring-error-700',
        neutral:
          'text-gray-950 border border-gray-300 hover:bg-gray-100 focus:ring-gray-200',
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

type BaseButtonProps = VariantProps<typeof button> & ComponentProps<'button'>;

export interface ButtonProps extends BaseButtonProps {
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    className,
    type = 'button',
    children,
    isLoading,
    variant,
    disabled,
    ...remainder
  } = props;

  return (
    <button
      {...remainder}
      ref={ref}
      type={type}
      disabled={disabled ?? undefined}
      className={twMerge(button({ variant, disabled }), className)}
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
        className={twMerge('flex items-center gap-1', isLoading && 'invisible')}
      >
        {children}
      </div>
    </button>
  );
});

export default Button;
