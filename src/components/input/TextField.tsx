import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export type BaseInputProps = Omit<
  ComponentProps<'input'>,
  'onChange' | 'placeholder' | 'type'
>;

interface TextFieldProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password';
  label?: string;
  error?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
}

/**
 * Text field component with a floating label.
 * Will turn red when error is true, and display a loading bar if loading is true.
 */
const TextField: React.FC<TextFieldProps> = (props) => {
  const {
    id,
    name,
    value,
    type = 'text',
    label,
    className,
    error,
    loading,
    onChange,
  } = props;

  return (
    <fieldset
      className={twMerge(
        'group relative rounded-md border transition-colors',
        error
          ? 'border-error-500'
          : 'border-gray-300 focus-within:border-primary-600',
        className
      )}
    >
      <input
        {...props}
        id={id}
        type={type}
        name={name}
        value={value}
        placeholder={label}
        onChange={(e) => onChange?.(e.target.value)}
        className='peer w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm placeholder:invisible placeholder:text-sm focus:outline-none focus:ring-0'
      />

      <legend className='ml-2 h-0 text-sm transition-[left,top] peer-placeholder-shown:w-0'>
        <span className='invisible px-1 text-xs'>{label}</span>
      </legend>

      <label
        htmlFor={name}
        className='pointer-events-none absolute left-2 top-0 -translate-y-1/2 px-1 text-xs transition-[left,top] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm'
      >
        {label}
      </label>

      <div className='pointer-events-none absolute -left-px -top-px h-[calc(100%+2px)] w-[calc(100%+2px)] overflow-hidden rounded-md border border-transparent'>
        {loading && (
          <div className='absolute bottom-0 h-0.5 w-full bg-gray-300'>
            <div className='animate-horizontal-track absolute left-0 h-full w-16 bg-primary-600'></div>
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default TextField;
