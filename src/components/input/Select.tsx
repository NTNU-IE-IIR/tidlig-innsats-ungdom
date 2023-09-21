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
            'rounded-md border border-gray-300 text-gray-700 transition-colors hover:bg-gray-200 focus:border-gray-400 focus:outline-none',
            disabled && 'cursor-not-allowed bg-opacity-75 hover:bg-transparent'
          )}
        >
          {renderSelected(value)}
        </Listbox.Button>
        <Transition as={Fragment}>
          <Listbox.Options className='absolute left-0 z-10 mt-1 w-fit divide-y divide-gray-300 overflow-auto rounded-md border border-gray-300 bg-gray-50 shadow-md focus:outline-none'>
            {options.map((item, itemIdx) => (
              <Listbox.Option
                key={itemIdx}
                value={item}
                className='cursor-pointer hover:bg-gray-100 ui-selected:bg-primary-50 ui-selected:font-medium ui-selected:text-primary-600'
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
