import { Switch as HeadlessSwitch } from '@headlessui/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

interface SwitchProps {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className='h-3 w-10 rounded-full bg-zinc-300 outline-none'
    >
      {({ checked }) => (
        <>
          <span className='sr-only'>{label}</span>
          <span
            aria-hidden
            className={twMerge(
              '-mt-1 flex h-5 w-5 transform items-center justify-center rounded-full bg-zinc-500 text-zinc-50 transition translate-x-0',
              checked && 'translate-x-5 bg-emerald-500'
            )}
          >
            <IconCheck className={twMerge('h-4 w-4', !checked && 'hidden')} />
            <IconX className={twMerge('h-4 w-4', checked && 'hidden')} />
          </span>
        </>
      )}
    </HeadlessSwitch>
  );
};

export default Switch;
