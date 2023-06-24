import { IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Button from '../input/Button';
import { useSessionStore } from '@/store/sessionStore';
import TextField from '../input/TextField';
import { api } from '@/utils/api';

interface SessionSummaryProps {
  sessionId: string;
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

const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionId }) => {
  const { clearViewedSession, viewedSessionMedias } = useSessionStore();
  const utils = api.useContext();
  const { mutateAsync: endConsultation } =
    api.consultation.endConsultation.useMutation({
      onSuccess: () => {
        utils.consultation.listConsultations.invalidate();
        utils.consultation.activeConsultation.invalidate();
      },
    });

  const onEndConsultation = async () => {
    await endConsultation({
      consultationId: sessionId,
      viewedMedias: viewedSessionMedias,
    });

    clearViewedSession();
  };

  const entries: SessionEntry[] = [
    {
      id: 1,
      media: {
        name: 'Kapittel 1',
        id: 1,
        themes: ['Tema 1', 'Tema 2'],
      },
      startedAt: new Date(),
      endedAt: new Date(),
    },
    {
      id: 2,
      media: {
        name: 'Kapittel 4',
        id: 1,
        themes: ['Tema 1', 'Tema 2'],
      },
      startedAt: dayjs().subtract(5, 'minute').toDate(),
      endedAt: new Date(),
    },
    {
      id: 3,
      media: {
        name: 'Kapittel 4',
        id: 1,
        themes: ['Tema 1', 'Tema 2'],
      },
      startedAt: dayjs().subtract(2, 'minute').toDate(),
      endedAt: new Date(),
    },
  ];

  return (
    <>
      <h1 className='text-xl font-semibold'>Øktsammendrag</h1>

      <TextField label='Navn' />

      <h2 className='-mb-2 font-semibold'>Tidslinje</h2>

      <hr className='border-zinc-300' />

      {entries.map((entry, i) => (
        <div key={entry.id} className='relative mb-8 flex items-center gap-2'>
          <div className='z-10 h-8 w-8 rounded-full bg-blue-500' />

          <div className='flex-1'>
            <h2 className='inline font-bold'>{entry.media.name}</h2>
            <time className='ml-1 inline text-sm font-medium'>
              {dayjs(entry.startedAt).from(entry.endedAt, true)}
            </time>
            <div className='flex flex-wrap gap-1'>
              {entry.media.themes.map((theme) => (
                <div
                  key={theme}
                  className='rounded-full border border-red-900 bg-red-100 px-1 text-xs font-medium text-red-900'
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>

          <IconChevronRight className='h-5 w-5' />

          {i !== 0 && (
            <div className='absolute bottom-full left-4 h-full w-0.5 -translate-x-1/2 bg-zinc-400' />
          )}
        </div>
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
