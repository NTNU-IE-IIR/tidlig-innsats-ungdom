import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

export interface DialogRendererProps {
  close: () => void;
}

export interface DialogProps {
  children?:
    | React.ReactNode
    | ((props: DialogRendererProps) => React.ReactNode);
  className?: string;
  open?: boolean;
  onClose: () => void;
}

/**
 * Dialog overlay component.
 * This portals the children to the end of the DOM, displaying it in a modal/dialog overlay.
 */
const Dialog: React.FC<DialogProps> = ({
  children,
  className,
  open,
  onClose,
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <HeadlessDialog
        as='div'
        className='relative z-10'
        onClose={() => onClose?.()}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <HeadlessDialog.Panel
                className={twMerge(
                  'w-full max-w-md transform overflow-hidden rounded-lg bg-zinc-50 p-1 shadow-lg transition-all',
                  className
                )}
              >
                {typeof children === 'function'
                  ? children({ close: onClose })
                  : children}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

export default Dialog;
