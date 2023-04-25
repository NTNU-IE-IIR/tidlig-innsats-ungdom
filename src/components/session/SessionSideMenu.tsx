import dayjs from 'dayjs';
import { useState } from 'react';
import Button from '../input/Button';
import SessionCard from './SessionCard';
import SessionSummary from './SessionSummary';

const SessionSideMenu = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>();

  return (
    <div className='mb-4 flex min-h-full w-full flex-col gap-2'>
      {!selectedSessionId && (
        <>
          <h1 className='text-xl font-semibold'>Øktoversikt</h1>
          <div className='flex flex-col gap-2'>
            {[...Array(6)].map((_, i) => (
              <SessionCard
                key={i}
                title={`Økt ${i + 1} ${dayjs().format('dddd')}`}
                startedAt={dayjs().subtract(1, 'hour').toDate()}
                endedAt={new Date()}
                onClick={() => setSelectedSessionId(i + 1)}
              />
            ))}
          </div>

          <Button className='mt-auto'>Ny økt</Button>
        </>
      )}

      {selectedSessionId && (
        <SessionSummary
          sessionId={selectedSessionId}
          onEnd={() => setSelectedSessionId(null)}
        />
      )}
    </div>
  );
};

export default SessionSideMenu;
