import { useSessionStore } from '@/store/sessionStore';
import { api } from '@/utils/api';
import { Transition } from '@headlessui/react';
import Button from '../input/Button';
import ActiveSession from './ActiveSession';
import EndedSession from './EndedSession';
import SessionCard from './SessionCard';

const SessionSideMenu = () => {
  const {
    activeSession,
    newSession,
    viewedConsultationId,
    setViewedConsultationId,
    showConsultation,
  } = useSessionStore();

  const { data: consultations } = api.consultation.listConsultations.useQuery(
    {}
  );

  const { data: viewedConsultation } =
    api.consultation.getConsultation.useQuery(viewedConsultationId!, {
      enabled: viewedConsultationId !== undefined,
    });

  return (
    <div className='relative h-full w-full overflow-x-hidden border-l border-black/10 bg-white'>
      <Transition
        show={viewedConsultationId === undefined && activeSession === null}
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
          {consultations?.length === 0 && (
            <p className='text-sm text-gray-500'>
              Ingen økter er opprettet enda
            </p>
          )}

          {consultations?.map((consultation) => (
            <SessionCard
              key={consultation.id}
              title={consultation.name}
              startedAt={consultation.startedAt}
              endedAt={consultation.endedAt!}
              onClick={() => setViewedConsultationId(consultation.id)}
            />
          ))}
        </div>

        <Button className='mt-auto' onClick={newSession}>
          Ny økt
        </Button>
      </Transition>

      <Transition
        show={showConsultation()}
        enter='transition-all duration-300 ease-out'
        enterFrom='transform translate-x-full opacity-0'
        enterTo='transform translate-x-0 opacity-100'
        leave='transition-all duration-300 ease-out'
        leaveFrom='transform translate-x-0 opacity-100'
        leaveTo='transform translate-x-full opacity-0'
        className='absolute flex h-full w-full flex-col gap-2 p-2'
      >
        {activeSession !== null && <ActiveSession />}
        {viewedConsultationId !== undefined &&
          viewedConsultation !== undefined && (
            <EndedSession
              key={viewedConsultation.id}
              id={viewedConsultation.id}
              name={viewedConsultation.name}
              notes={viewedConsultation.notes}
              entries={viewedConsultation.viewedMedias}
              onClose={() => setViewedConsultationId(undefined)}
            />
          )}
      </Transition>
    </div>
  );
};

export default SessionSideMenu;
