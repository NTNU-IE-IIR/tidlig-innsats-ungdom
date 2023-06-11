import { Dialog, Transition } from '@headlessui/react';
import { IconX } from '@tabler/icons-react';
import { Fragment } from 'react';
import Button from '../input/Button';
import { twMerge } from 'tailwind-merge';

interface SlideOverPanelProps {
  children: React.ReactNode;
  className?: string;
  open: boolean;
  onClose: () => void;
}

const SlideOverPanel: React.FC<SlideOverPanelProps> = ({
  children,
  className,
  open,
  onClose,
}) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-in-out duration-500'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in-out duration-500'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-hidden'>
          <div className='absolute inset-0 overflow-hidden'>
            <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
              <Transition.Child
                as={Fragment}
                enter='transform transition ease-in-out duration-500 sm:duration-700'
                enterFrom='translate-x-full'
                enterTo='translate-x-0'
                leave='transform transition ease-in-out duration-500 sm:duration-700'
                leaveFrom='translate-x-0'
                leaveTo='translate-x-full'
              >
                <Dialog.Panel className='pointer-events-auto w-screen max-w-md'>
                  <div className='relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl'>
                    <Button
                      variant='neutral'
                      onClick={onClose}
                      className='absolute left-4 top-4 w-fit px-1'
                    >
                      <span className='sr-only'>Close panel</span>
                      <IconX className='h-5 w-5' aria-hidden='true' />
                    </Button>
                    <div className={twMerge('mt-6 flex-1 px-4', className)}>
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SlideOverPanel;
