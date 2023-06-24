import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { api } from '@/utils/api';
import { Transition } from '@headlessui/react';
import Button from '../input/Button';
import SessionCard from './SessionCard';
import SessionSummary from './SessionSummary';

const SessionSideMenu = () => {
  const { viewedSessionId, setViewedSessionId, clearViewedSession } =
    useSessionStore();
  const { activeTenantId } = useTenantStore();

  const { data: consultations } = api.consultation.listConsultations.useQuery(
    {}
  );

  const { mutateAsync: newConsultation } =
    api.consultation.newConsultation.useMutation();

  const createNewConsultation = async () => {
    const consultation = await newConsultation({
      tenantId: activeTenantId!,
    });

    setViewedSessionId(consultation);
  };

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
        className='absolute flex h-full w-full flex-col gap-2 overflow-hidden p-2'
      >
        <h1 className='text-xl font-semibold'>Øktoversikt</h1>
        <div className='flex flex-1 flex-col gap-2 overflow-y-auto'>
          {consultations?.map((consultation) => (
            <SessionCard
              key={consultation.id}
              title={consultation.name}
              startedAt={consultation.startedAt}
              endedAt={consultation.endedAt!}
              onClick={() => setViewedSessionId(consultation.id)}
            />
          ))}
        </div>

        <Button className='mt-auto' onClick={createNewConsultation}>
          Ny økt
        </Button>
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
          onEnd={clearViewedSession}
        />
      </Transition>
    </div>
  );
};

export default SessionSideMenu;
