import { useSessionStore } from '@/store/sessionStore';
import dayjs from 'dayjs';
import Button from '../input/Button';
import SessionCard from './SessionCard';
import SessionSummary from './SessionSummary';

const SessionSideMenu = () => {
  const { viewedSessionId, setViewedSessionId, clearViewedSessionId } =
    useSessionStore();

  return (
    <div className='flex min-h-full w-full flex-col gap-2'>
      {!viewedSessionId && (
        <>
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
        </>
      )}

      {viewedSessionId && (
        <SessionSummary
          sessionId={viewedSessionId}
          onEnd={clearViewedSessionId}
        />
      )}
    </div>
  );
};

export default SessionSideMenu;
