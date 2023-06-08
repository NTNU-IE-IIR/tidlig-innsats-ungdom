import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SelectProps<T> {
  value: T;
  options: T[];
  disabled?: boolean;
  onChange?: (value: T) => void;
  renderer: (item: T) => React.ReactNode;
  selectedRenderer?: (item: T) => React.ReactNode;
}

const Select = <T,>({
  value,
  options,
  disabled,
  onChange,
  renderer,
  selectedRenderer,
}: SelectProps<T>) => {
  const renderSelected = selectedRenderer ?? renderer;

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className='relative'>
        <Listbox.Button
          className={twMerge(
            'rounded-md border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-200 focus:border-zinc-400 focus:outline-none',
            disabled && 'cursor-not-allowed bg-opacity-75 hover:bg-transparent'
          )}
        >
          {renderSelected(value)}
        </Listbox.Button>
        <Transition as={Fragment}>
          <Listbox.Options className='absolute left-0 z-10 mt-1 w-fit divide-y divide-zinc-300 overflow-auto rounded-md border border-zinc-300 bg-zinc-50 shadow-md focus:outline-none'>
            {options.map((item, itemIdx) => (
              <Listbox.Option
                key={itemIdx}
                value={item}
                className='cursor-pointer hover:bg-zinc-100 ui-selected:bg-zinc-200 ui-selected:font-medium ui-selected:text-emerald-600'
              >
                {renderer(item)}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default Select;
