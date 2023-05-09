import { Switch as HeadlessSwitch } from '@headlessui/react';
import { IconCheck, IconX } from '@tabler/icons-react';

interface SwitchProps {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  const Icon = checked ? IconCheck : IconX;

  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className='h-3 w-10 rounded-full bg-zinc-300 outline-none'
    >
      <span className='sr-only'>{label}</span>
      <span
        aria-hidden
        className='-mt-1 flex h-5 w-5 transform items-center justify-center rounded-full bg-zinc-500 text-zinc-50 transition ui-checked:translate-x-5 ui-checked:bg-emerald-500 ui-not-checked:translate-x-0'
      >
        <Icon className='h-4 w-4' />
      </span>
    </HeadlessSwitch>
  );
};

export default Switch;
