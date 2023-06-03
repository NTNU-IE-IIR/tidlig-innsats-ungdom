import {
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const alert = cva(['border rounded-md px-2 py-1 flex gap-2 items-center'], {
  variants: {
    intent: {
      info: ['bg-sky-100', 'border-sky-500', 'text-sky-800'],
      success: ['bg-emerald-100', 'border-emerald-500', 'text-emerald-800'],
      warning: ['bg-yellow-50', 'border-yellow-600', 'text-yellow-800'],
      error: ['bg-red-100', 'border-red-500', 'text-red-800'],
    },
  },
});

export interface AlertProps extends VariantProps<typeof alert> {
  children?: React.ReactNode | string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ intent, children, className }) => {
  return (
    <div className={twMerge(alert({ intent }), className)}>
      {intent === 'info' && (
        <IconInfoCircle className='h-6 w-6 flex-shrink-0' />
      )}
      {intent === 'success' && <IconCheck className='h-6 w-6 flex-shrink-0' />}
      {intent === 'warning' && (
        <IconAlertTriangle className='h-6 w-6 flex-shrink-0' />
      )}
      {intent === 'error' && <IconX className='h-6 w-6 flex-shrink-0' />}

      <span className='text-sm'>{children}</span>
    </div>
  );
};

export default Alert;
