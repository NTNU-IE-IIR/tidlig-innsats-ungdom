import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { ComponentProps, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export type BaseInputProps = Omit<
  ComponentProps<'input'>,
  'onChange' | 'placeholder' | 'type'
>;

interface NumberFieldProps extends BaseInputProps {
  min?: number;
  max?: number;
  label?: string;
  error?: boolean;
  className?: string;
  onChange?: (value: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = (props) => {
  const { id, error, label, name, className, value, onChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const increment = () => {
    const currentValue = inputRef.current?.valueAsNumber ?? 0;
    const newValue = currentValue + 1;

    if (inputRef.current) inputRef.current.valueAsNumber = newValue;
    onChange?.(newValue);
  };

  const decrement = () => {
    const currentValue = inputRef.current?.valueAsNumber ?? 0;
    const newValue = currentValue - 1;

    if (inputRef.current) inputRef.current.valueAsNumber = newValue;
    onChange?.(newValue);
  };

  return (
    <fieldset
      className={twMerge(
        'number-input-wrapper group relative rounded-md border transition-colors',
        error
          ? 'border-red-500'
          : 'border-zinc-300 focus-within:border-emerald-600',
        className
      )}
    >
      <input
        {...props}
        id={id}
        type='number'
        name={name}
        value={value ?? 0}
        placeholder={label}
        min={props.min}
        max={props.max}
        ref={inputRef}
        onChange={(e) => onChange?.(e.target.valueAsNumber)}
        className='peer w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm placeholder:invisible placeholder:text-sm focus:outline-none focus:ring-0'
      />

      <legend className='ml-2 h-0 text-sm transition-[top,left] peer-placeholder-shown:w-0'>
        <span className='invisible px-1 text-xs'>{label}</span>
      </legend>

      <label
        htmlFor={name}
        className='pointer-events-none absolute left-2 top-0 -translate-y-1/2 px-1 text-xs transition-[top,left] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm'
      >
        {label}
      </label>

      <div className='absolute right-0 top-0 flex h-full flex-col items-center justify-center border-l border-zinc-300'>
        <button
          type='button'
          onClick={increment}
          className='h-1/2 rounded-tr-md border-b border-b-zinc-300 px-1 hover:bg-zinc-200 focus:bg-zinc-200 focus:outline-none'
        >
          <span className='sr-only'>Increment {label}</span>
          <IconChevronUp className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={decrement}
          className='h-1/2 rounded-br-md px-1 hover:bg-zinc-200 focus:bg-zinc-200 focus:outline-none'
        >
          <span className='sr-only'>Decrement {label}</span>
          <IconChevronDown className='h-4 w-4' />
        </button>
      </div>
    </fieldset>
  );
};

export default NumberField;
