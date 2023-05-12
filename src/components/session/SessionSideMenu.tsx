import { useSessionStore } from '@/store/sessionStore';
import dayjs from 'dayjs';
import Button from '../input/Button';
import SessionCard from './SessionCard';
import SessionSummary from './SessionSummary';
import { Transition } from '@headlessui/react';

const SessionSideMenu = () => {
  const { viewedSessionId, setViewedSessionId, clearViewedSessionId } =
    useSessionStore();

  return (
    <div className='relative h-full w-full overflow-x-hidden border-l border-black/10 bg-white'>
      <Transition
        show={viewedSessionId === null}
        enter='transition-all duration-300 ease-out'
        enterFrom='transform -translate-x-full opacity-0'
        enterTo='transform translate-x-0 opacity-100'
        leave='transition-all duration-300 ease-out'
        leaveFrom='transform translate-x-0 opacity-100'
        leaveTo='transform -translate-x-full opacity-0'
        className='absolute flex h-full w-full flex-col gap-2 p-2'
      >
        <h1 className='text-xl font-semibold'>Øktoversikt</h1>
        <div className='flex flex-col gap-2'>
          {[...Array(6)].map((_, i) => (
            <SessionCard
              key={i}
              title={`Økt ${i + 1} ${dayjs().format('dddd')}`}
              startedAt={dayjs().subtract(1, 'hour').toDate()}
              endedAt={new Date()}
              onClick={() => setViewedSessionId(i + 1)}
            />
          ))}
        </div>

        <Button className='mt-auto'>Ny økt</Button>
      </Transition>

      <Transition
        show={viewedSessionId !== null}
        enter='transition-all duration-300 ease-out'
        enterFrom='transform translate-x-full opacity-0'
        enterTo='transform translate-x-0 opacity-100'
        leave='transition-all duration-300 ease-out'
        leaveFrom='transform translate-x-0 opacity-100'
        leaveTo='transform translate-x-full opacity-0'
        className='absolute flex h-full w-full flex-col gap-2 p-2'
      >
        <SessionSummary
          sessionId={viewedSessionId!}
          onEnd={clearViewedSessionId}
        />
      </Transition>
    </div>
  );
};

export default SessionSideMenu;
