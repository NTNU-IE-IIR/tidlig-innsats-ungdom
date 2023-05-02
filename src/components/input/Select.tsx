import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export interface SelectProps<T> {
  value: T;
  options: T[];
  onChange?: (value: T) => void;
  renderer: (item: T) => React.ReactNode;
}

const Select = <T,>({ value, options, onChange, renderer }: SelectProps<T>) => {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className='relative'>
        <Listbox.Button className='rounded-md border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-200'>
          {renderer(value)}
        </Listbox.Button>
        <Transition as={Fragment}>
          <Listbox.Options className='absolute left-0 z-10 mt-1 w-fit divide-y divide-zinc-300 overflow-auto rounded-md border border-zinc-300 bg-zinc-50 shadow-md'>
            {options.map((item, itemIdx) => (
              <Listbox.Option
                key={itemIdx}
                value={item}
                className='cursor-pointer ui-selected:bg-zinc-100 ui-selected:text-emerald-500'
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
