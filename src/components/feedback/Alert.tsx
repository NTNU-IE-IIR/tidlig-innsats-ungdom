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
      info: ['bg-info-100', 'border-info-500', 'text-info-800'],
      success: ['bg-ok-100', 'border-ok-500', 'text-ok-800'],
      warning: ['bg-warn-50', 'border-warn-600', 'text-warn-800'],
      error: ['bg-error-100', 'border-error-500', 'text-error-800'],
    },
  },
});

export interface AlertProps extends VariantProps<typeof alert> {
  children?: React.ReactNode | string;
  className?: string;
  onCancel?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  intent,
  children,
  className,
  onCancel,
}) => {
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

      <span className='flex-1 text-sm'>{children}</span>

      {onCancel && (
        <button className='flex-shrink-0' onClick={onCancel}>
          <IconX />
        </button>
      )}
    </div>
  );
};

export default Alert;
