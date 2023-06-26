import { IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Button from '../input/Button';
import { useSessionStore } from '@/store/sessionStore';
import TextField from '../input/TextField';
import { api } from '@/utils/api';
import Link from 'next/link';
import { useState } from 'react';

interface SessionSummaryProps {
  sessionId: string;
  sessionName: string;
  onEnd: () => void;
}

interface SessionEntry {
  id: number;
  media: {
    name: string;
    id: number;
    themes: string[];
  };
  startedAt: Date;
  endedAt: Date;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  sessionId,
  sessionName: initialSessionName,
}) => {
  const { clearViewedSession, viewedSessionMedias } = useSessionStore();
  const utils = api.useContext();
  const { mutateAsync: endConsultation } =
    api.consultation.endConsultation.useMutation({
      onSuccess: () => {
        utils.consultation.listConsultations.invalidate();
        utils.consultation.activeConsultation.invalidate();
      },
    });

  const [sessionName, setSessionName] = useState(initialSessionName);

  const { data: entries } = api.media.getByIdsWithThemes.useQuery(
    Object.keys(viewedSessionMedias).map(Number)
  );

  const onEndConsultation = async () => {
    await endConsultation({
      consultationId: sessionId,
      consultationName: sessionName,
      viewedMedias: viewedSessionMedias,
    });

    clearViewedSession();
  };

  return (
    <>
      <h1 className='text-xl font-semibold'>Øktsammendrag</h1>

      <TextField label='Navn' value={sessionName} onChange={setSessionName} />

      <h2 className='-mb-2 font-semibold'>Tidslinje</h2>

      <hr className='border-zinc-300' />

      {entries?.map((entry, i) => (
        <Link
          key={entry.id}
          className='relative mb-8 flex items-center gap-2 rounded-md border border-transparent p-1 hover:border-zinc-200 hover:bg-zinc-100'
          href={`/media/${entry.id}`}
        >
          <div className='z-10 h-8 w-8 rounded-full bg-blue-500' />

          <div className='flex-1'>
            <h2 className='inline font-bold'>{entry.name}</h2>

            <time className='ml-1 inline text-sm font-medium'>
              {dayjs
                .duration(viewedSessionMedias[entry.id] ?? 0, 'seconds')
                .humanize()}
            </time>

            <div className='flex flex-wrap gap-1'>
              {entry.themes.map(({ theme }) => (
                <div
                  key={theme?.id}
                  className='rounded-full border border-red-900 bg-red-100 px-1 text-xs font-medium text-red-900'
                >
                  {theme?.name}
                </div>
              ))}
            </div>
          </div>

          <IconChevronRight className='h-5 w-5' />

          {i !== 0 && (
            <div className='absolute bottom-full left-5 h-full w-0.5 -translate-x-1/2 translate-y-1 bg-zinc-400' />
          )}
        </Link>
      ))}

      <h2 className='-mb-2 mt-auto font-semibold'>Notater</h2>
      <textarea className='h-40 resize-none rounded-md border border-zinc-300 bg-zinc-100 p-2 outline-none focus:border-zinc-400 focus:ring-0' />

      <Button variant='destructive' onClick={onEndConsultation}>
        Stopp økt
      </Button>
    </>
  );
};

export default SessionSummary;
